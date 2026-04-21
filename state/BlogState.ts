import type { Agent } from "@tokenring-ai/agent";
import { AgentStateSlice } from "@tokenring-ai/agent/types";
import { z } from "zod";
import { type BlogPost, BlogPostSchema } from "../BlogProvider.ts";
import type { BlogAgentConfigSchema } from "../schema.ts";

const serializationSchema = z
  .object({
    activeProvider: z.string().optional(),
    reviewPatterns: z.array(z.string()).optional(),
    reviewEscalationTarget: z.string().optional(),
    currentPost: BlogPostSchema.optional(),
  })
  .prefault({});

export class BlogState extends AgentStateSlice<typeof serializationSchema> {
  activeProvider: string | undefined;
  reviewPatterns?: string[] | undefined;
  reviewEscalationTarget?: string | undefined;
  currentPost: BlogPost | undefined;

  constructor(readonly initialConfig: z.output<typeof BlogAgentConfigSchema>) {
    super("BlogState", serializationSchema);
    this.activeProvider = initialConfig.provider;
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
      currentPost: this.currentPost,
    };
  }

  deserialize(data: z.output<typeof serializationSchema>): void {
    this.activeProvider = data.activeProvider;
    this.reviewPatterns = data.reviewPatterns;
    this.reviewEscalationTarget = data.reviewEscalationTarget;
    this.currentPost = data.currentPost;
  }

  show(): string {
    return `Active Blog: ${this.activeProvider}`;
  }
}
