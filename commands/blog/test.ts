import {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import BlogService from "../../BlogService.ts";
import {testBlogConnection} from "../../util/testBlogConnection.js";

const inputSchema = {} as const satisfies AgentCommandInputSchema;

async function execute({agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> {
  await testBlogConnection(agent.requireServiceByType(BlogService), agent);
  return "Blog test was successful";
}

export default {
  name: "blog test",
  description: "Test blog connection",
  inputSchema,
  execute,
  help: `Test the blog connection by listing posts, creating a test post, uploading an image, and updating the post.

## Example

/blog test`,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
