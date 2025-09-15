import Agent from "@tokenring-ai/agent/Agent";
import {marked} from "marked";
import {z} from "zod";
import BlogService from "../BlogService.ts";

export const name = "blog/createPost";

export async function execute(
  {title, contentInMarkdown, tags}: {
    title?: string;
    contentInMarkdown?: string;
    tags?: string[];
  },
  agent: Agent,
) {
  if (!title) {
    throw new Error("Title is required");
  }
  if (!contentInMarkdown) {
    throw new Error("Content is required");
  }

  const blogService = agent.requireFirstServiceByType(BlogService);

  // Strip the header from the post;
  contentInMarkdown = contentInMarkdown.replace(/^\s*#.*/, "").trim();

  const post = await blogService.createPost({
    title,
    status: "draft",
    content: marked(contentInMarkdown, { async: false}),
    tags
  },agent);

  agent.infoLine(`[${name}] Post created with ID: ${post.id}`);
  return post;
}

export const description = "Create a new blog post";

export const inputSchema = z.object({
  title: z.string().describe("Title of the blog post"),
  contentInMarkdown: z
    .string()
    .describe(
      "The content of the post in Markdown format. The title of the post goes in the title tag, NOT inside the content",
    ),
  tags: z.array(z.string()).describe("Tags for the post").optional()
});