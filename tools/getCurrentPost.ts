import ChatService from "@token-ring/chat/ChatService";
import type {Registry} from "@token-ring/registry";
import {z} from "zod";
import BlogService from "../BlogService.ts";

export const name = "blog/getCurrentPost";

export async function execute(
  {},
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


  chatService.infoLine(`[${name}] Getting current post from ${blogName}`);

  const currentPost = activeBlog.getCurrentPost();

  if (!currentPost) {
    return {
      success: false,
      error: "No post is currently selected",
      suggestion: "Select a post first using the selectPost tool",
    };
  }

  return {
    success: true,
    post: currentPost,
    message: `Currently selected: "${currentPost.title}" (${currentPost.status})`,
  };
}

export const description = "Get the currently selected post from a blog service";

export const inputSchema = z.object({});