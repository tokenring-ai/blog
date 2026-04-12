import type Agent from "@tokenring-ai/agent/Agent";
import type {TokenRingToolDefinition, TokenRingToolResult} from "@tokenring-ai/chat/schema";
import {z} from "zod";
import BlogService from "../BlogService.ts";

const name = "blog_getCurrentPost";
const displayName = "Blog/getCurrentPost";

function execute(_args: z.output<typeof inputSchema>, agent: Agent): TokenRingToolResult {
  const blogService = agent.requireServiceByType(BlogService);
  const currentPost = blogService.getCurrentPost(agent);

  if (!currentPost) {
    throw new Error("No post is currently selected. Select a post first using the selectPost tool");
  }

  return JSON.stringify({
    success: true,
    post: currentPost,
    message: `Currently selected: "${currentPost.title}" (${currentPost.status})`,
  });
}

const description = "Get the currently selected post from a blog service";

const inputSchema = z.object({});

export default {
  name,
  displayName,
  description,
  inputSchema,
  execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;
