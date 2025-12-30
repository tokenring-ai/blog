import Agent from "@tokenring-ai/agent/Agent";
import BlogService from "../../../BlogService.ts";

export async function clear(remainder: string, agent: Agent): Promise<void> {
  const blogService = agent.requireServiceByType(BlogService);
  await blogService.clearCurrentPost(agent);
  agent.infoLine("Post cleared. No post is currently selected. Use /blog post select to choose a post.");
}