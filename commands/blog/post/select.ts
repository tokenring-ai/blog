import Agent from "@tokenring-ai/agent/Agent";
import type {TreeLeaf} from "@tokenring-ai/agent/question";
import BlogService from "../../../BlogService.ts";
import {BlogState} from "../../../state/BlogState.ts";

export async function select(remainder: string, agent: Agent): Promise<void> {
  const blogService = agent.requireServiceByType(BlogService);
  const activeProvider = agent.getState(BlogState).activeProvider;

  try {
    const posts = await blogService.getAllPosts(agent);

    if (!posts || posts.length === 0) {
      agent.infoMessage(`No posts found on ${activeProvider}.`);
      return;
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
        agent.infoMessage("Post selection cleared.");
      } else {
        const post = await blogService.selectPostById(selection[0], agent);
        agent.infoMessage(`Selected post: "${post.title}"`);
      }
    } else {
      agent.infoMessage("Post selection cancelled.");
    }
  } catch (error) {
    agent.errorMessage("Error during post selection:", error as Error);
  }
}