import {Agent} from "@tokenring-ai/agent";
import type {AgentStateSlice} from "@tokenring-ai/agent/types";
import {z} from "zod";
import {BlogAgentConfigSchema} from "../schema.ts";

const serializationSchema = z.object({
  activeProvider: z.string().nullable(),
  reviewPatterns: z.array(z.string()).optional(),
  reviewEscalationTarget: z.string().optional(),
}).prefault({ activeProvider: null});

export class BlogState implements AgentStateSlice<typeof serializationSchema> {
  readonly name = "BlogState";
  serializationSchema = serializationSchema;
  activeProvider: string | null
  reviewPatterns?: string[];
  reviewEscalationTarget?: string;

  constructor(readonly initialConfig: z.output<typeof BlogAgentConfigSchema>) {
    this.activeProvider = initialConfig.provider ?? null;
    this.reviewPatterns = initialConfig.reviewPatterns;
    this.reviewEscalationTarget = initialConfig.reviewEscalationTarget;
  }

  transferStateFromParent(parent: Agent): void {
    this.activeProvider ??= parent.getState(BlogState).activeProvider;
  }

  serialize(): z.output<typeof serializationSchema> {
    return { 
      activeProvider: this.activeProvider,
      reviewPatterns: this.reviewPatterns,
      reviewEscalationTarget: this.reviewEscalationTarget,
    };
  }

  deserialize(data: z.output<typeof serializationSchema>): void {
    this.activeProvider = data.activeProvider;
    this.reviewPatterns = data.reviewPatterns;
    this.reviewEscalationTarget = data.reviewEscalationTarget;
  }

  show(): string[] {
    return [`Active Blog: ${this.activeProvider}`];
  }
}
