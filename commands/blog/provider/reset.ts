import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import BlogService from "../../../BlogService.ts";
import {BlogState} from "../../../state/BlogState.ts";

export async function reset(_remainder: string, agent: Agent): Promise<string> {
  const blogService = agent.requireServiceByType(BlogService);
  const initialProvider = agent.getState(BlogState).initialConfig.provider;
  
  if (!initialProvider) {
    throw new CommandFailedError("No initial provider configured");
  }
  
  blogService.setActiveProvider(initialProvider, agent);
  return `Provider reset to ${initialProvider}`;
}
