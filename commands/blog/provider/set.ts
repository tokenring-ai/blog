import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import BlogService from "../../../BlogService.ts";

const inputSchema = {
  args: {},
  prompt: {
    description: "The provider name to set",
    required: true,
  },
  allowAttachments: false,
} as const satisfies AgentCommandInputSchema;

async function execute({prompt, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> {
  const blogService = agent.requireServiceByType(BlogService);
  const providerName = prompt.trim();
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

export default {name: "blog provider set", description: "Set the active provider", inputSchema, help, execute} satisfies TokenRingAgentCommand<typeof inputSchema>;
