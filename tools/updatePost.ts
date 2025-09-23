import Agent from "@tokenring-ai/agent/Agent";
import {marked} from "marked";
import {z} from "zod";
import {UpdatePostData} from "../BlogResource.js";
import BlogService from "../BlogService.ts";

export const name = "blog/updatePost";

export async function execute(
  {title, contentInMarkdown, tags}: {
    title?: string;
    contentInMarkdown?: string;
    tags?: string[];
  },
  agent: Agent,
) {
  const blogService = agent.requireServiceByType(BlogService);

  if (contentInMarkdown) {
    // Strip the header from the post;
    contentInMarkdown = contentInMarkdown.replace(/^\s*#.*/, "").trim();
  }

  const update: UpdatePostData = {};
  if (title) update.title = title;
  if (contentInMarkdown) update.content = marked(contentInMarkdown, { async: false});
  if (tags) update.tags = tags;


  const updatedPost = await blogService.updatePost(update,agent);

  agent.infoLine(`[${name}] Post updated with ID: ${updatedPost.id}`);
  return updatedPost;
}

export const description = "Update the currently selected blog post";

export const inputSchema = z.object({
  title: z.string().describe("New title for the post").optional(),
  contentInMarkdown: z
    .string()
    .describe(
      "The content of the post in Markdown format. The title of the post goes in the title tag, NOT inside the content",
    )
    .optional(),
  tags: z.array(z.string()).describe("New tags for the post").optional(),
});