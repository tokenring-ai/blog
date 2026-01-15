import Agent from "@tokenring-ai/agent/Agent";
import BlogService from "../../../BlogService.ts";

export async function get(remainder: string, agent: Agent): Promise<void> {
  const blogService = agent.requireServiceByType(BlogService);
  const currentPost = blogService.getCurrentPost(agent);

  if (!currentPost) {
    agent.infoMessage("No post is currently selected.");
    return;
  }

  agent.infoMessage(`Current post: ${currentPost.title}`);
}
