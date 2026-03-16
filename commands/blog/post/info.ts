import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import BlogService from "../../../BlogService.ts";
import {BlogState} from "../../../state/BlogState.ts";

async function execute(_remainder: string, agent: Agent): Promise<string> {
  const blogService = agent.requireServiceByType(BlogService);
  const currentPost = blogService.getCurrentPost(agent);
  if (!currentPost) return "No post is currently selected.\nUse /blog post select to choose a post.";
  const wordCount = currentPost.content
    ? currentPost.content.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length : 0;
  const lines = [
    `Blog: ${agent.getState(BlogState).activeProvider}`,
    `Title: ${currentPost.title}`,
    `Status: ${currentPost.status}`,
    `Created: ${new Date(currentPost.created_at).toLocaleString()}`,
    `Updated: ${new Date(currentPost.updated_at).toLocaleString()}`,
    `Word count (approx.): ${wordCount}`,
  ];
  if (currentPost.tags?.length) lines.push(`Tags: ${currentPost.tags.join(", ")}`);
  if (currentPost.url) lines.push(`URL: ${currentPost.url}`);
  return lines.join("\n");
}

const help = `# /blog post info

Display detailed information about the currently selected post, including title, status, dates, word count, tags, and URL.

## Example

/blog post info`;

export default {name: "blog post info", description: "Show info about current post", help, execute} satisfies TokenRingAgentCommand;