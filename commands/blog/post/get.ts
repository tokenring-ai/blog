import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import BlogService from "../../../BlogService.ts";

export default {
  name: "blog post get",
  description: "Show current post",
  help: `# /blog post get

Display the currently selected post title. Use /blog post info for full details.

## Example

/blog post get`,
  execute: async (_remainder: string, agent: Agent): Promise<string> => {
    const post = agent.requireServiceByType(BlogService).getCurrentPost(agent);
    return post ? `Current post: ${post.title}` : "No post is currently selected.";
  },
} satisfies TokenRingAgentCommand;
