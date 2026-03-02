import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import BlogService from "../../../BlogService.ts";
import {BlogState} from "../../../state/BlogState.ts";

async function execute(_remainder: string, agent: Agent): Promise<string> {
  const initialProvider = agent.getState(BlogState).initialConfig.provider;
  if (!initialProvider) throw new CommandFailedError("No initial provider configured");
  agent.requireServiceByType(BlogService).setActiveProvider(initialProvider, agent);
  return `Provider reset to ${initialProvider}`;
}

const help = `# /blog provider reset

Reset the active blog provider to the initial configured value.

## Example

/blog provider reset`;

export default { name: "blog provider reset", description: "/blog provider reset - Reset to initial provider", help, execute } satisfies TokenRingAgentCommand;
