import Agent from "@tokenring-ai/agent/Agent";
import {BlogState} from "../../../state/BlogState.ts";

export async function get(_remainder: string, agent: Agent): Promise<string> {
  const activeProvider = agent.getState(BlogState).activeProvider;
  return `Current provider: ${activeProvider ?? "(none)"}`;
}
