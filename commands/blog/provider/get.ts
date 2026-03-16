import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {BlogState} from "../../../state/BlogState.ts";

export default {
  name: "blog provider get",
  description: "Show current provider",
  help: `# /blog provider get

Display the currently active blog provider.

## Example

/blog provider get`,
  execute: async (_remainder: string, agent: Agent): Promise<string> =>
    `Current provider: ${agent.getState(BlogState).activeProvider ?? "(none)"}`,
} satisfies TokenRingAgentCommand;
