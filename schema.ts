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
  agentDefaults: BlogAgentConfigSchema,
  defaultImageModels: z.array(z.string()).default([]),
});
