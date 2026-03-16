import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import BlogService from "../../../BlogService.ts";

async function execute(remainder: string, agent: Agent): Promise<string> {
  const blogService = agent.requireServiceByType(BlogService);
  const providerName = remainder.trim();
  if (!providerName) throw new CommandFailedError("Usage: /blog provider set <name>");
  const available = blogService.getAvailableBlogs();
  if (available.includes(providerName)) {
    blogService.setActiveProvider(providerName, agent);
    return `Active provider set to: ${providerName}`;
  }
  return `Provider "${providerName}" not found. Available providers: ${available.join(", ")}`;
}

const help = `# /blog provider set <name>

Set the active blog provider by name.

## Example

/blog provider set wordpress`;

export default {name: "blog provider set", description: "Set the active provider", help, execute} satisfies TokenRingAgentCommand;