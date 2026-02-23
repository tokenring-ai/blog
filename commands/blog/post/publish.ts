import Agent from "@tokenring-ai/agent/Agent";
import BlogService from "../../../BlogService.ts";

export async function publish(remainder: string, agent: Agent): Promise<string> {
  const blogService = agent.requireServiceByType(BlogService);
  await blogService.publishPost(agent);
  return "Post published successfully.";
}