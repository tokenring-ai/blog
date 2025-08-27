import ChatService from "@token-ring/chat/ChatService";
import type {Registry} from "@token-ring/registry";
import {z} from "zod";
import BlogService from "../BlogService.ts";

export const name = "blog/updatePost";

export async function execute(
  {title, content, tags}: {
    title?: string;
    content?: string;
    tags?: string[];
  },
  registry: Registry,
) {
  const chatService = registry.requireFirstServiceByType(ChatService);
  const blogService = registry.requireFirstServiceByType(BlogService);

  const currentPost = blogService.getCurrentPost();
  if (!currentPost) {
    throw new Error(`No post currently selected`);
  }

  if (!title && !content && !tags) {
    throw new Error("At least one of title, content, or tags must be provided");
  }

  chatService.infoLine(`[${name}] Updating post "${currentPost.title}"`);

  const updatedPost = await blogService.updatePost({title, content, tags});

  return {
    success: true,
    post: updatedPost,
    message: `Post "${updatedPost.title}" updated successfully`,
    changes: {title: !!title, content: !!content, tags: !!tags},
  };
}

export const description = "Update the currently selected blog post";

export const inputSchema = z.object({
  title: z.string().describe("New title for the post").optional(),
  content: z.string().describe("New content for the post").optional(),
  tags: z.array(z.string()).describe("New tags for the post").optional(),
});