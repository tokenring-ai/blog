import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import BlogService from "../../../BlogService.ts";
import {BlogState} from "../../../state/BlogState.ts";

const inputSchema = {} as const satisfies AgentCommandInputSchema;

function execute({
                   agent,
                 }: AgentCommandInputType<typeof inputSchema>): string {
  const blogService = agent.requireServiceByType(BlogService);
  const currentPost = blogService.getCurrentPost(agent);
  if (!currentPost)
    return "No post is currently selected.\nUse /blog post select to choose a post.";
  const wordCount = currentPost.html
    ? currentPost.html
      .replace(/<[^>]*>/g, " ")
      .split(/\s+/)
      .filter(Boolean).length
    : 0;
  const lines = [
    `Blog: ${agent.getState(BlogState).activeProvider}`,
    `Title: ${currentPost.title}`,
    `Status: ${currentPost.status}`,
    `Created: ${new Date(currentPost.created_at).toLocaleString()}`,
    `Updated: ${new Date(currentPost.updated_at).toLocaleString()}`,
    `Word count (approx.): ${wordCount}`,
  ];
  if (currentPost.tags?.length)
    lines.push(`Tags: ${currentPost.tags.join(", ")}`);
  if (currentPost.url) lines.push(`URL: ${currentPost.url}`);
  return lines.join("\n");
}

const help = `Display detailed information about the currently selected post, including title, status, dates, word count, tags, and URL.

## Example

/blog post info`;

export default {
  name: "blog post info",
  description: "Show info about current post",
  inputSchema,
  help,
  execute,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
