import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import BlogService from "../../../BlogService.ts";

export default {
  name: "blog post clear",
  description: "Clear current post selection",
  help: `# /blog post clear

Clear the current post selection. Use this to start fresh with no post selected.

## Example

/blog post clear`,
  execute: async (_remainder: string, agent: Agent): Promise<string> => {
    await agent.requireServiceByType(BlogService).clearCurrentPost(agent);
    return "Post cleared. No post is currently selected. Use /blog post select to choose a post.";
  },
} satisfies TokenRingAgentCommand;