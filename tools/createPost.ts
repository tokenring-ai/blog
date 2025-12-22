import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/types";
import {marked} from "marked";
import {z} from "zod";
import BlogService from "../BlogService.ts";

const name = "blog_createPost";

async function execute(
  {title, contentInMarkdown, tags}: z.infer<typeof inputSchema>,
  agent: Agent,
) {
  if (!title) {
    throw new Error("Title is required");
  }
  if (!contentInMarkdown) {
    throw new Error("Content is required");
  }

  const blogService = agent.requireServiceByType(BlogService);

  // Strip the header from the post;
  contentInMarkdown = contentInMarkdown.replace(/^\s*#.*/, "").trim();

  const post = await blogService.createPost({
    title,
    content: marked(contentInMarkdown, { async: false}),
    tags
  },agent);

  agent.infoLine(`[${name}] Post created with ID: ${post.id}`);
  return post;
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
  name, description, inputSchema, execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;