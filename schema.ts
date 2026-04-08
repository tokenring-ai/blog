import {z} from "zod";

export const BlogAgentConfigSchema = z.object({
  provider: z.string().optional(),
  imageModel: z.string().optional(),
  reviewPatterns: z.array(z.string()).optional(),
  reviewEscalationTarget: z.string().optional(),
}).default({});

export const BlogConfigSchema = z.object({
  agentDefaults: BlogAgentConfigSchema,
  defaultImageModels: z.array(z.string()).default([]),
});
