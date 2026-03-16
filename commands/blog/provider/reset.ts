import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import BlogService from "../../../BlogService.ts";
import {BlogState} from "../../../state/BlogState.ts";

const inputSchema = {
  args: {},
  allowAttachments: false,
} as const satisfies AgentCommandInputSchema;

async function execute({agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> {
  const initialProvider = agent.getState(BlogState).initialConfig.provider;
  if (!initialProvider) throw new CommandFailedError("No initial provider configured");
  agent.requireServiceByType(BlogService).setActiveProvider(initialProvider, agent);
  return `Provider reset to ${initialProvider}`;
}

const help = `# /blog provider reset

Reset the active blog provider to the initial configured value.

## Example

/blog provider reset`;

export default {name: "blog provider reset", description: "Reset to initial provider", inputSchema, help, execute} satisfies TokenRingAgentCommand<typeof inputSchema>;
