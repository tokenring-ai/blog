import Agent from "@tokenring-ai/agent/Agent";
import BlogService from "../../../BlogService.ts";
import {BlogState} from "../../../state/BlogState.ts";

export async function reset(_remainder: string, agent: Agent): Promise<void> {
  const blogService = agent.requireServiceByType(BlogService);
  const initialProvider = agent.getState(BlogState).initialConfig.provider;
  
  if (initialProvider) {
    blogService.setActiveProvider(initialProvider, agent);
    agent.infoMessage(`Provider reset to ${initialProvider}`);
  } else {
    agent.errorMessage("No initial provider configured");
  }
}
