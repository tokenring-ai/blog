import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/schema";
import {marked} from "marked";
import {z} from "zod";
import {UpdatePostData} from "../BlogProvider.js";
import BlogService from "../BlogService.ts";

const name = "blog_updatePost";

async function execute(
  {title, contentInMarkdown, tags}: z.infer<typeof inputSchema>,
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

  agent.infoMessage(`[${name}] Post updated with ID: ${updatedPost.id}`);
  return updatedPost;
}

const description = "Update the currently selected blog post";

const inputSchema = z.object({
  title: z.string().describe("New title for the post").optional(),
  contentInMarkdown: z
    .string()
    .describe(
      "The content of the post in Markdown format. The title of the post goes in the title tag, NOT inside the content",
    )
    .optional(),
  tags: z.array(z.string()).describe("New tags for the post").optional(),
});

export default {
  name, description, inputSchema, execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;