import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import type {TreeLeaf} from "@tokenring-ai/agent/question";
import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand,} from "@tokenring-ai/agent/types";
import BlogService from "../../../BlogService.ts";

const inputSchema = {} as const satisfies AgentCommandInputSchema;

async function execute({
                         agent,
                       }: AgentCommandInputType<typeof inputSchema>): Promise<string> {
  const blogService = agent.requireServiceByType(BlogService);
  try {
    const posts = await blogService.getAllPosts(agent);
    if (!posts?.length) return `No posts found.`;
    const tree: TreeLeaf[] = posts.map((post) => ({
      name: `${post.status === "published" ? "📝" : "🔒"} ${post.title} (${new Date(post.updated_at).toLocaleDateString()})`,
      value: post.id,
    }));
    const selection = await agent.askQuestion({
      message:
        "Choose a post to work with or select 'Clear selection' to start fresh",
      question: {
        type: "treeSelect",
        label: "Post Selection",
        key: "result",
        minimumSelections: 1,
        maximumSelections: 1,
        tree,
      },
    });
    if (!selection) return "Post selection cancelled.";
    if (selection.length === 0) {
      await blogService.clearCurrentPost(agent);
      return "Post selection cleared.";
    }
    const post = await blogService.selectPostById(selection[0], agent);
    return `Selected post: "${post.title}"`;
  } catch (error) {
    throw new CommandFailedError(
      `Error during post selection: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

const help = `Interactively select a post to work with. Shows post status (📝 published, 🔒 draft) and last updated date.

## Example

/blog post select`;

export default {
  name: "blog post select",
  description: "Select a post",
  inputSchema,
  help,
  execute,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
