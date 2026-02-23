import Agent from "@tokenring-ai/agent/Agent";
import BlogService from "../../../BlogService.ts";

export async function get(remainder: string, agent: Agent): Promise<string> {
  const blogService = agent.requireServiceByType(BlogService);
  const currentPost = blogService.getCurrentPost(agent);

  if (!currentPost) {
    return "No post is currently selected.";
  }

  return `Current post: ${currentPost.title}`;
}
