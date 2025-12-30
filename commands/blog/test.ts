import Agent from "@tokenring-ai/agent/Agent";
import BlogService from "../../BlogService.ts";
import {testBlogConnection} from "../../util/testBlogConnection.js";

export async function test(remainder: string, agent: Agent): Promise<void> {
  const blogService = agent.requireServiceByType(BlogService);
  await testBlogConnection(blogService, agent);
}
