import Agent from "@tokenring-ai/agent/Agent";
import type {TreeLeaf} from "@tokenring-ai/agent/question";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import BlogService from "../../../BlogService.ts";

async function execute(_remainder: string, agent: Agent): Promise<string> {
  const blogService = agent.requireServiceByType(BlogService);
  try {
    const posts = await blogService.getAllPosts(agent);
    if (!posts?.length) return `No posts found.`;
    const tree: TreeLeaf[] = posts.map(post => ({
      name: `${post.status === "published" ? "📝" : "🔒"} ${post.title} (${new Date(post.updated_at).toLocaleDateString()})`,
      value: post.id,
    }));
    const selection = await agent.askQuestion({
      message: "Choose a post to work with or select 'Clear selection' to start fresh",
      question: { type: 'treeSelect', label: "Post Selection", key: "result", minimumSelections: 1, maximumSelections: 1, tree },
    });
    if (!selection) return "Post selection cancelled.";
    if (selection.length === 0) {
      await blogService.clearCurrentPost(agent);
      return "Post selection cleared.";
    }
    const post = await blogService.selectPostById(selection[0], agent);
    return `Selected post: "${post.title}"`;
  } catch (error) {
    throw new CommandFailedError(`Error during post selection: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const help = `# /blog post select

Interactively select a post to work with. Shows post status (📝 published, 🔒 draft) and last updated date.

## Example

/blog post select`;

export default { name: "blog post select", description: "/blog post select - Select a post", help, execute } satisfies TokenRingAgentCommand;
