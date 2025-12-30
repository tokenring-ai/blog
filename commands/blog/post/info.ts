import Agent from "@tokenring-ai/agent/Agent";
import BlogService from "../../../BlogService.ts";
import {BlogState} from "../../../state/BlogState.ts";

export async function info(remainder: string, agent: Agent): Promise<void> {
  const blogService = agent.requireServiceByType(BlogService);
  const activeProvider = agent.getState(BlogState).activeProvider;
  const currentPost = blogService.getCurrentPost(agent);

  if (!currentPost) {
    agent.infoLine("No post is currently selected.");
    agent.infoLine("Use /blog post select to choose a post.");
    return;
  }

  const createdDate = new Date(currentPost.created_at).toLocaleString();
  const updatedDate = new Date(currentPost.updated_at).toLocaleString();
  const wordCount = currentPost.content
    ? currentPost.content.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length
    : 0;

  const infoLines = [
    `Blog: ${activeProvider}`,
    `Title: ${currentPost.title}`,
    `Status: ${currentPost.status}`,
    `Created: ${createdDate}`,
    `Updated: ${updatedDate}`,
    `Word count (approx.): ${wordCount}`,
  ];

  if (currentPost.tags && currentPost.tags.length > 0) {
    infoLines.push(`Tags: ${currentPost.tags.join(", ")}`);
  }

  if (currentPost.url) {
    infoLines.push(`URL: ${currentPost.url}`);
  }

  agent.infoLine(infoLines.join("\n"));
}