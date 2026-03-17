import {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import BlogService from "../../../BlogService.ts";

const inputSchema = {} as const satisfies AgentCommandInputSchema;

async function execute({agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> {
  await agent.requireServiceByType(BlogService).clearCurrentPost(agent);
  return "Post cleared. No post is currently selected. Use /blog post select to choose a post.";
}

export default {
  name: "blog post clear",
  description: "Clear current post selection",
  inputSchema,
  execute,
  help: `Clear the current post selection. Use this to start fresh with no post selected.

## Example

/blog post clear`,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
