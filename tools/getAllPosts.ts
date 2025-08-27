import ChatService from "@token-ring/chat/ChatService";
import type {Registry} from "@token-ring/registry";
import {z} from "zod";
import BlogService from "../BlogService.ts";

export const name = "blog/getAllPosts";

export async function execute(
  {status = "all", tag, limit = 10}: {
    status?: "draft" | "published" | "all";
    tag?: string;
    limit?: number;
  },
  registry: Registry,
) {
  const chatService = registry.requireFirstServiceByType(ChatService);
  const blogService = registry.requireFirstServiceByType(BlogService);
  const blogName = blogService.getActiveBlog();
  if (!blogName) {
    throw new Error("No active blog selected. Use /blog blog select first.");
  }
  const activeBlog = blogService.getBlogByName(blogName);
  if (!activeBlog) {
    throw new Error("No active blog selected. Use /blog blog select first.");
  }

  chatService.infoLine(`[${name}] Listing posts from ${blogName}`);

  let posts = await activeBlog.getAllPosts();

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
  const currentPost = blogService.getCurrentPost();

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