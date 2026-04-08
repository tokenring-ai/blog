import {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import BlogService from "../../../BlogService.ts";
import {BlogState} from "../../../state/BlogState.ts";

const inputSchema = {} as const satisfies AgentCommandInputSchema;

async function execute({agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> {
  const available = agent.requireServiceByType(BlogService).getAvailableBlogs();
  if (available.length === 0) return "No blog providers are registered.";
  const active = agent.getState(BlogState).activeProvider;
  return available.map(name => `${name}${name === active ? " (active)" : ""}`).join("\n");
}

export default {
  name: "blog provider list",
  description: "List all registered blog providers",
  inputSchema,
  execute,
  help: `List all registered blog providers, indicating the active one.\n\n## Example\n\n/blog provider list`,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
