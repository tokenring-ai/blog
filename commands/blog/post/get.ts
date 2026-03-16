import {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import BlogService from "../../../BlogService.ts";

const inputSchema = {
  args: {},
  allowAttachments: false,
} as const satisfies AgentCommandInputSchema;

async function execute({agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> {
  const post = agent.requireServiceByType(BlogService).getCurrentPost(agent);
  return post ? `Current post: ${post.title}` : "No post is currently selected.";
}

export default {
  name: "blog post get",
  description: "Show current post",
  inputSchema,
  execute,
  help: `# /blog post get

Display the currently selected post title. Use /blog post info for full details.

## Example

/blog post get`,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
