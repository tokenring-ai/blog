import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/schema";
import {z} from "zod";
import BlogService from "../BlogService.ts";

const name = "blog_getAllPosts";
const displayName = "Blog/getAllPosts";

async function execute(
  {status = "all", tag, limit = 10}: z.output<typeof inputSchema>,
  agent: Agent,
) {
  const blogService = agent.requireServiceByType(BlogService);

  let posts = await blogService.getAllPosts(agent);

  if (status !== "all") {
    posts = posts.filter(post => post.status === status);
  }

  if (tag) {
    posts = posts.filter(post => 
      post.tags?.some(postTag => postTag === tag)
    );
  }

  const limitedPosts = posts.slice(0, limit);
  const currentPost = blogService.getCurrentPost(agent);

  return {
    type: 'json' as const,
    data: {
      success: true,
      posts: limitedPosts,
      message: `Found ${posts.length} posts${posts.length > limit ? `, showing ${limit}` : ""}`,
      count: posts.length,
      currentlySelected: currentPost?.id || null,
    }
  };
}

const description = "Get all posts from a blog service";

const inputSchema = z.object({
  status: z.enum(["draft", "published", "all"]).default("all").optional(),
  tag: z.string().describe("Filter by tag").optional(),
  limit: z.number().int().positive().default(10).optional(),
});

export default {
  name, displayName, description, inputSchema, execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;