import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/types";
import {z} from "zod";
import BlogService from "../BlogService.ts";

const name = "blog/getAllPosts";

async function execute(
  {status = "all", tag, limit = 10}: z.infer<typeof inputSchema>,
  agent: Agent,
) {
  const blogService = agent.requireServiceByType(BlogService);

  let posts = await blogService.getAllPosts(agent);

  if (status !== "all") {
    posts = posts.filter(post => post.status === status);
  }

  if (tag) {
    posts = posts.filter(post => 
      post.tags?.some(postTag => 
        typeof postTag === "string" ? postTag === tag : postTag === tag
      )
    );
  }

  const limitedPosts = posts.slice(0, limit);
  const currentPost = blogService.getCurrentPost(agent);

  return {
    success: true,
    posts: limitedPosts,
    message: `Found ${posts.length} posts${posts.length > limit ? `, showing ${limit}` : ""}`,
    count: posts.length,
    currentlySelected: currentPost?.id || null,
  };
}

const description = "Get all posts from a blog service";

const inputSchema = z.object({
  status: z.enum(["draft", "published", "all"]).default("all").optional(),
  tag: z.string().describe("Filter by tag").optional(),
  limit: z.number().int().positive().default(10).optional(),
});

export default {
  name, description, inputSchema, execute,
} as TokenRingToolDefinition<typeof inputSchema>;