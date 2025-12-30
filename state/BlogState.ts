import {Agent} from "@tokenring-ai/agent";
import type {ResetWhat} from "@tokenring-ai/agent/AgentEvents";
import type {AgentStateSlice} from "@tokenring-ai/agent/types";
import {z} from "zod";
import {BlogAgentConfigSchema} from "../schema.ts";

export class BlogState implements AgentStateSlice {
  name = "BlogState";
  activeProvider: string | null

  constructor(readonly initialConfig: z.output<typeof BlogAgentConfigSchema>) {
    this.activeProvider = initialConfig.provider ?? null;
  }

  transferStateFromParent(parent: Agent): void {
    this.activeProvider = parent.getState(BlogState).activeProvider;
  }

  reset(what: ResetWhat[]): void {}

  serialize(): object {
    return { activeProvider: this.activeProvider };
  }

  deserialize(data: any): void {
    this.activeProvider = data.activeProvider;
  }

  show(): string[] {
    return [`Active Blog: ${this.activeProvider}`];
  }
}