import Agent from "@tokenring-ai/agent/Agent";
import type {BlogPost} from "../../../BlogProvider.ts";
import BlogService from "../../../BlogService.ts";
import {BlogState} from "../../../state/BlogState.ts";

export async function select(remainder: string, agent: Agent): Promise<void> {
  const blogService = agent.requireServiceByType(BlogService);
  const activeProvider = agent.getState(BlogState).activeProvider;

  try {
    const posts = await blogService.getAllPosts(agent);

    if (!posts || posts.length === 0) {
      agent.infoLine(`No posts found on ${activeProvider}.`);
      return;
    }

    const formattedPosts = posts.map((post) => {
      const date = new Date(post.updated_at).toLocaleDateString();
      const status = post.status === "published" ? "📝" : "🔒";
      return {
        name: `${status} ${post.title} (${date})`,
        value: post.id,
        data: post,
      };
    });

    formattedPosts.unshift({
      name: "❌ Clear selection",
      value: "none",
      data: null as unknown as BlogPost
    });

    const selectedValue = await agent.askHuman({
      type: "askForSingleTreeSelection",
      title: "Post Selection",
      message: `Choose a post to work with or select 'Clear selection' to start fresh`,
      tree: {name: `${activeProvider} Posts`, children: formattedPosts}
    });

    if (selectedValue) {
      if (selectedValue === "none") {
        await blogService.clearCurrentPost(agent);
        agent.infoLine("Post selection cleared.");
      } else {
        const selectedPost = formattedPosts.find(post => post.value === selectedValue);
        if (selectedPost?.data) {
          await blogService.selectPostById(selectedPost.data.id, agent);
          agent.infoLine(`Selected post: "${selectedPost.data.title}"`);
        }
      }
    } else {
      agent.infoLine("Post selection cancelled.");
    }
  } catch (error) {
    agent.errorLine("Error during post selection:", error as Error);
  }
}