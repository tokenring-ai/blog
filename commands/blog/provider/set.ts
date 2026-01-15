import Agent from "@tokenring-ai/agent/Agent";
import BlogService from "../../../BlogService.ts";

export async function set(remainder: string, agent: Agent): Promise<void> {
  const blogService = agent.requireServiceByType(BlogService);
  const providerName = remainder.trim();

  if (!providerName) {
    agent.errorMessage("Usage: /blog provider set <name>");
    return;
  }

  const availableBlogs = blogService.getAvailableBlogs();
  if (availableBlogs.includes(providerName)) {
    blogService.setActiveProvider(providerName, agent);
    agent.infoMessage(`Active provider set to: ${providerName}`);
  } else {
    agent.infoMessage(`Provider "${providerName}" not found. Available providers: ${availableBlogs.join(", ")}`);
  }
}