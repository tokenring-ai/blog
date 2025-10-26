import {ResetWhat} from "@tokenring-ai/agent/AgentEvents";
import type { AgentStateSlice } from "@tokenring-ai/agent/types";

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

  show(): string[] {
    return [
      `Active Blog: ${this.activeBlogName || 'None'}`
    ];
  }
}