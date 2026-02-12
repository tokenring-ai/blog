import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/schema";
import {z} from "zod";
import BlogService from "../BlogService.ts";

const name = "blog_selectPost";
const displayName = "Blog/selectPost";

async function execute(
  {id}: z.output<typeof inputSchema>,
  agent: Agent,
) {
  const blogService = agent.requireServiceByType(BlogService);

  const post = await blogService.selectPostById(id, agent);

  return `
Selected post: "${post.title}" (ID: ${post.id})
Status: ${post.status}
Created at: ${post.created_at.toISOString()}

JSON representation:
${JSON.stringify(post, null, 2)}

You can now perform actions on this post like updating or publishing it.
  `.trim();
}

const description = "Selects a blog post by its ID to perform further actions on it";

const inputSchema = z.object({
  id: z.string().describe("The unique identifier of the post to select"),
});

export default {
  name, displayName, description, inputSchema, execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;