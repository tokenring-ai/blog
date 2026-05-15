import { z } from "zod";

export const BlogAgentConfigSchema = z
  .object({
    provider: z.string().exactOptional(),
    imageModel: z.string().exactOptional(),
    reviewPatterns: z.array(z.string()).exactOptional(),
    reviewEscalationTarget: z.string().exactOptional(),
  })
  .default({});

export const BlogConfigSchema = z.object({
  agentDefaults: z.object({
    provider: z.string().exactOptional(),
    imageModel: z.string().exactOptional(),
    reviewPatterns: z.array(z.string()).default([]),
    reviewEscalationTarget: z.string().exactOptional(),
  }).prefault({}),
  defaultImageModels: z.array(z.string()).default([]),
});

export type ParsedBlogConfig = z.output<typeof BlogConfigSchema>;