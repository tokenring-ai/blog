import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import BlogService from "../../BlogService.ts";
import {testBlogConnection} from "../../util/testBlogConnection.js";

export default {
  name: "blog test",
  description: "/blog test - Test blog connection",
  help: `# /blog test

Test the blog connection by listing posts, creating a test post, uploading an image, and updating the post.

## Example

/blog test`,
  execute: async (_remainder: string, agent: Agent): Promise<string> => {
    await testBlogConnection(agent.requireServiceByType(BlogService), agent);
    return "Blog test was successful";
  },
} satisfies TokenRingAgentCommand;
