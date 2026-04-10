import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand,} from "@tokenring-ai/agent/types";
import BlogService from "../../../BlogService.ts";

const inputSchema = {} as const satisfies AgentCommandInputSchema;

async function execute({
                         agent,
                       }: AgentCommandInputType<typeof inputSchema>): Promise<string> {
  await agent.requireServiceByType(BlogService).publishPost(agent);
  return "Post published successfully.";
}

export default {
  name: "blog post publish",
  description: "Publish current post",
  inputSchema,
  execute,
  help: `Publish the currently selected post, changing its status from draft to published.

## Example

/blog post publish`,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
