import {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {BlogState} from "../../../state/BlogState.ts";

const inputSchema = {} as const satisfies AgentCommandInputSchema;

async function execute({agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> {
  return `Current provider: ${agent.getState(BlogState).activeProvider ?? "(none)"}`;
}

export default {
  name: "blog provider get",
  description: "Show current provider",
  inputSchema,
  execute,
  help: `Display the currently active blog provider.

## Example

/blog provider get`,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
