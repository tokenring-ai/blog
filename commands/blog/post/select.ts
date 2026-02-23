import Agent from "@tokenring-ai/agent/Agent";
import type {TreeLeaf} from "@tokenring-ai/agent/question";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import BlogService from "../../../BlogService.ts";
import {BlogState} from "../../../state/BlogState.ts";

export async function select(remainder: string, agent: Agent): Promise<string> {
  const blogService = agent.requireServiceByType(BlogService);
  const activeProvider = agent.getState(BlogState).activeProvider;

  try {
    const posts = await blogService.getAllPosts(agent);

    if (!posts || posts.length === 0) {
      return `No posts found on ${activeProvider}.`;
    }

    const formattedPosts: TreeLeaf[] = posts.map((post) => {
      const date = new Date(post.updated_at).toLocaleDateString();
      const status = post.status === "published" ? "📝" : "🔒";
      return {
        name: `${status} ${post.title} (${date})`,
        value: post.id,
      };
    });

    const selection = await agent.askQuestion({
      message: `Choose a post to work with or select 'Clear selection' to start fresh`,
      question: {
        type: 'treeSelect',
        label: "Post Selection",
        key: "result",
        minimumSelections: 1,
        maximumSelections: 1,
        tree: formattedPosts
      }
    });

    if (selection) {
      if (selection.length === 0) {
        await blogService.clearCurrentPost(agent);
        return "Post selection cleared.";
      } else {
        const post = await blogService.selectPostById(selection[0], agent);
        return `Selected post: "${post.title}"`;
      }
    } else {
      return "Post selection cancelled.";
    }
  } catch (error) {
    throw new CommandFailedError(`Error during post selection: ${error instanceof Error ? error.message : String(error)}`);
  }
}
