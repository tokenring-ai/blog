import Agent from "@tokenring-ai/agent/Agent";
import {z} from "zod";
import BlogService from "../BlogService.ts";

export const name = "blog/getAllPosts";

export async function execute(
  {status = "all", tag, limit = 10}: {
    status?: "draft" | "published" | "all";
    tag?: string;
    limit?: number;
  },
  agent: Agent,
) {
  const blogService = agent.requireFirstServiceByType(BlogService);

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

export const description = "Get all posts from a blog service";

export const inputSchema = z.object({
  status: z.enum(["draft", "published", "all"]).default("all").optional(),
  tag: z.string().describe("Filter by tag").optional(),
  limit: z.number().int().positive().default(10).optional(),
});