import ChatService from "@token-ring/chat/ChatService";
import type {Registry} from "@token-ring/registry";
import {z} from "zod";
import BlogService from "../BlogService.ts";

export const name = "blog/createPost";

export async function execute(
  {title, content, tags, published}: {
    title?: string;
    content?: string;
    tags?: string[];
    published?: boolean;
  },
  registry: Registry,
) {
  if (!title) {
    throw new Error("Title is required");
  }
  if (!content) {
    throw new Error("Content is required");
  }

  const chatService = registry.requireFirstServiceByType(ChatService);
  const blogService = registry.requireFirstServiceByType(BlogService);
  const activeBlogName = blogService.getActiveBlog();
  if (!activeBlogName) {
    throw new Error("No active blog selected. Use /blog blog select first.");
  }
  const activeBlog = blogService.getBlogByName(activeBlogName);
  if (!activeBlog) {
    throw new Error("No active blog selected. Use /blog blog select first.");
  }

  chatService.infoLine(`[${name}] Creating post "${title}" on ${activeBlogName}`);

  const post = await activeBlog.createPost({
    title,
    content,
    tags,
    published,
  });

  chatService.infoLine(`[${name}] Post created with ID: ${post.id}`);
  return post;
}

export const description = "Create a new blog post";

export const inputSchema = z.object({
  title: z.string().describe("Title of the blog post"),
  content: z.string().describe("Content of the blog post"),
  tags: z.array(z.string()).describe("Tags for the post").optional(),
  published: z.boolean().describe("Whether to publish immediately").optional(),
});