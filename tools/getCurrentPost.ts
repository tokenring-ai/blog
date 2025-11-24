import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/types";
import {z} from "zod";
import BlogService from "../BlogService.ts";

const name = "blog/getCurrentPost";

async function execute(
  {}: z.infer<typeof inputSchema>,
  agent: Agent,
) {
  const blogService = agent.requireServiceByType(BlogService);
  const currentPost = blogService.getCurrentPost(agent);

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

const description = "Get the currently selected post from a blog service";

const inputSchema = z.object({});

export default {
  name, description, inputSchema, execute,
} as TokenRingToolDefinition<typeof inputSchema>;