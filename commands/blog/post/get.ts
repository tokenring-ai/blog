import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import BlogService from "../../../BlogService.ts";

const inputSchema = {} as const satisfies AgentCommandInputSchema;

function execute({
                   agent,
                 }: AgentCommandInputType<typeof inputSchema>): string {
  const post = agent.requireServiceByType(BlogService).getCurrentPost(agent);
  return post
    ? `Current post: ${post.title}`
    : "No post is currently selected.";
}

export default {
  name: "blog post get",
  description: "Show current post",
  inputSchema,
  execute,
  help: `Display the currently selected post title. Use /blog post info for full details.

## Example

/blog post get`,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
