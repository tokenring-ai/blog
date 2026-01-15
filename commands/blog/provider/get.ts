import Agent from "@tokenring-ai/agent/Agent";
import {BlogState} from "../../../state/BlogState.ts";

export async function get(_remainder: string, agent: Agent): Promise<void> {
  const activeProvider = agent.getState(BlogState).activeProvider;
  agent.infoMessage(`Current provider: ${activeProvider ?? "(none)"}`);
}
