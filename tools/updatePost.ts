import type Agent from "@tokenring-ai/agent/Agent";
import type { TokenRingToolDefinition, TokenRingToolResult } from "@tokenring-ai/chat/schema";
import { marked } from "marked";
import { z } from "zod";
import type { UpdatePostData } from "../BlogProvider.ts";
import BlogService from "../BlogService.ts";

const name = "blog_updatePost";
const displayName = "Blog/updatePost";

async function execute({ title, contentInMarkdown, tags }: z.output<typeof inputSchema>, agent: Agent): Promise<TokenRingToolResult> {
  const blogService = agent.requireServiceByType(BlogService);

  if (contentInMarkdown) {
    // Strip the header from the post;
    contentInMarkdown = contentInMarkdown.replace(/^\s*#.*/, "").trim();
  }

  const update: UpdatePostData = {};
  if (title) update.title = title;
  if (contentInMarkdown) update.html = marked(contentInMarkdown, { async: false });
  if (tags) update.tags = tags;

  const updatedPost = await blogService.updateCurrentPost(update, agent);

  return JSON.stringify(updatedPost);
}

const description = "Update the currently selected blog post";

const inputSchema = z.object({
  title: z.string().describe("New title for the post").exactOptional(),
  contentInMarkdown: z
    .string()
    .describe("The content of the post in Markdown format. The title of the post goes in the title tag, NOT inside the content")
    .exactOptional(),
  tags: z.array(z.string()).describe("New tags for the post").exactOptional(),
});

export default {
  name,
  displayName,
  description,
  inputSchema,
  execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;
