import type Agent from "@tokenring-ai/agent/Agent";
import type {TokenRingToolDefinition, TokenRingToolResult} from "@tokenring-ai/chat/schema";
import markdownTable from "@tokenring-ai/utility/string/markdownTable";
import {z} from "zod";
import BlogService from "../BlogService.ts";

const name = "blog_getRecentPosts";
const displayName = "Blog/getRecentPosts";

async function execute(
  {status, keyword, limit}: z.output<typeof inputSchema>,
  agent: Agent,
): Promise<TokenRingToolResult> {
  const blogService = agent.requireServiceByType(BlogService);
  if (status === "all") status = undefined;

  const posts = await blogService.getRecentPosts(
    {status, keyword, limit},
    agent,
  );

  return `
Here are the ${posts.length} most recent posts

${markdownTable(
    ["ID", "Title", "Created At", "Status"],
    posts.map((post) => [
      post.id,
      post.title,
      new Date(post.created_at).toISOString(),
      post.status,
    ]),
)}

  `.trim();
}

const description =
  "Retrieves the most recent published posts, optionally filtered by status and keyword";

const inputSchema = z.object({
  status: z.enum(["draft", "published", "all"]).optional(),
  keyword: z.string().describe("Keyword to filter by").optional(),
  limit: z.number().int().positive().default(50).optional(),
});

export default {
  name,
  displayName,
  description,
  inputSchema,
  execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;
