import {Agent} from "@tokenring-ai/agent";
import type {AgentStateSlice} from "@tokenring-ai/agent/types";
import {z} from "zod";
import {BlogAgentConfigSchema} from "../schema.ts";

const serializationSchema = z.object({
  activeProvider: z.string().nullable()
}).prefault({ activeProvider: null});

export class BlogState implements AgentStateSlice<typeof serializationSchema> {
  readonly name = "BlogState";
  serializationSchema = serializationSchema;
  activeProvider: string | null

  constructor(readonly initialConfig: z.output<typeof BlogAgentConfigSchema>) {
    this.activeProvider = initialConfig.provider ?? null;
  }

  transferStateFromParent(parent: Agent): void {
    this.activeProvider ??= parent.getState(BlogState).activeProvider;
  }

  serialize(): z.output<typeof serializationSchema> {
    return { activeProvider: this.activeProvider };
  }

  deserialize(data: z.output<typeof serializationSchema>): void {
    this.activeProvider = data.activeProvider;
  }

  show(): string[] {
    return [`Active Blog: ${this.activeProvider}`];
  }
}
