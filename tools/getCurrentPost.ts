import ChatService from "@token-ring/chat/ChatService";
import type {Registry} from "@token-ring/registry";
import {z} from "zod";
import BlogService from "../BlogService.ts";

export const name = "blog/getCurrentPost";

export async function execute(
  {},
  registry: Registry,
) {
  const blogService = registry.requireFirstServiceByType(BlogService);
  const currentPost = blogService.getCurrentPost();

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