import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import BlogService from "../../../BlogService.ts";

export async function set(remainder: string, agent: Agent): Promise<string> {
  const blogService = agent.requireServiceByType(BlogService);
  const providerName = remainder.trim();

  if (!providerName) {
    throw new CommandFailedError("Usage: /blog provider set <name>");
  }

  const availableBlogs = blogService.getAvailableBlogs();
  if (availableBlogs.includes(providerName)) {
    blogService.setActiveProvider(providerName, agent);
    return `Active provider set to: ${providerName}`;
  } else {
    return `Provider "${providerName}" not found. Available providers: ${availableBlogs.join(", ")}`;
  }
}