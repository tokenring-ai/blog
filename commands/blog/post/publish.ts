import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import BlogService from "../../../BlogService.ts";

export default {
  name: "blog post publish",
  description: "Publish current post",
  help: `# /blog post publish

Publish the currently selected post, changing its status from draft to published.

## Example

/blog post publish`,
  execute: async (_remainder: string, agent: Agent): Promise<string> => {
    await agent.requireServiceByType(BlogService).publishPost(agent);
    return "Post published successfully.";
  },
} satisfies TokenRingAgentCommand;