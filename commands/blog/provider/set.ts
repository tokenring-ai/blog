import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import BlogService from "../../../BlogService.ts";

const inputSchema = {
  args: {},
  positionals: [
    {
      name: "name",
      description: "The provider name to set",
      required: true,
    },
  ],
} as const satisfies AgentCommandInputSchema;

function execute({
                   positionals,
                   agent,
                 }: AgentCommandInputType<typeof inputSchema>): string {
  const blogService = agent.requireServiceByType(BlogService);
  const providerName = positionals.name;
  if (!providerName)
    throw new CommandFailedError("Usage: /blog provider set <name>");
  const available = blogService.getAvailableBlogs();
  if (available.includes(providerName)) {
    blogService.setActiveProvider(providerName, agent);
    return `Active provider set to: ${providerName}`;
  }
  return `Provider "${providerName}" not found. Available providers: ${available.join(", ")}`;
}

const help = `Set the active blog provider by name.

## Example

/blog provider set wordpress`;

export default {
  name: "blog provider set",
  description: "Set the active provider",
  inputSchema,
  help,
  execute,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
