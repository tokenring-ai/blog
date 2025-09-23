import {AgentStateSlice} from "@tokenring-ai/agent/Agent";
import {ResetWhat} from "@tokenring-ai/agent/AgentEvents";

export class BlogState implements AgentStateSlice {
  name = "BlogState";
  activeBlogName: string | undefined;

  constructor({ activeBlogName }: { activeBlogName?: string }) {
    this.activeBlogName = activeBlogName;
  }

  reset(what: ResetWhat[]): void {
    if (what.includes("chat")) {
      this.activeBlogName = undefined;
    }
  }

  serialize(): object {
    return {
      activeBlogName: this.activeBlogName,
    };
  }

  deserialize(data: any): void {
    this.activeBlogName = data.activeBlogName;
  }
}