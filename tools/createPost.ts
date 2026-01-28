import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/schema";
import {marked} from "marked";
import {z} from "zod";
import BlogService from "../BlogService.ts";

const name = "blog_createPost";
const displayName = "Blog/createPost";

async function execute(
  {title, contentInMarkdown, tags}: z.output<typeof inputSchema>,
  agent: Agent,
) {
  const blogService = agent.requireServiceByType(BlogService);

  // Strip the header from the post;
  contentInMarkdown = contentInMarkdown.replace(/^\s*#.*/, "").trim();

  const post = await blogService.createPost({
    title,
    content: marked(contentInMarkdown, { async: false}),
    tags
  },agent);

  agent.infoMessage(`[${name}] Post created with ID: ${post.id}`);
  return { type: 'json' as const, data: post };
}

const description = "Create a new blog post";

const inputSchema = z.object({
  title: z.string().describe("Title of the blog post"),
  contentInMarkdown: z
    .string()
    .describe(
      "The content of the post in Markdown format. The title of the post goes in the title tag, NOT inside the content",
    ),
  tags: z.array(z.string()).describe("Tags for the post").optional()
});

export default {
  name, displayName, description, inputSchema, execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;