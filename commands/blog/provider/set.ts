import Agent from "@tokenring-ai/agent/Agent";
import BlogService from "../../../BlogService.ts";

export async function set(remainder: string, agent: Agent): Promise<void> {
  const blogService = agent.requireServiceByType(BlogService);
  const providerName = remainder.trim();

  if (!providerName) {
    agent.errorLine("Usage: /blog provider set <name>");
    return;
  }

  const availableBlogs = blogService.getAvailableBlogs();
  if (availableBlogs.includes(providerName)) {
    blogService.setActiveProvider(providerName, agent);
    agent.infoLine(`Active provider set to: ${providerName}`);
  } else {
    agent.infoLine(`Provider "${providerName}" not found. Available providers: ${availableBlogs.join(", ")}`);
  }
}