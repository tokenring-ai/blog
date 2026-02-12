import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/schema";
import {z} from "zod";
import BlogService from "../BlogService.ts";
import markdownTable from "@tokenring-ai/utility/string/markdownTable";

const name = "blog_getRecentPosts";
const displayName = "Blog/getRecentPosts";

async function execute(
  {status, keyword, limit}: z.output<typeof inputSchema>,
  agent: Agent,
) {
  const blogService = agent.requireServiceByType(BlogService);
  if (status === "all") status = undefined;

  let posts = await blogService.getRecentPosts({ status, keyword, limit}, agent);

  return `
Here are the ${posts.length} most recent posts

${markdownTable(
  ["ID", "Title", "Created At", "Status"],
  posts.map(post => [post.id, post.title, post.created_at.toISOString(), post.status]),
)}

  `.trim();
}

const description = "Retrieves the most recent published posts, optionally filtered by status and keyword";

const inputSchema = z.object({
  status: z.enum(["draft", "published", "all"]).optional(),
  keyword: z.string().describe("Keyword to filter by").optional(),
  limit: z.number().int().positive().default(50).optional(),
});

export default {
  name, displayName, description, inputSchema, execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;