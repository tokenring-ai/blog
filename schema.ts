import {z} from "zod";

export const BlogConfigSchema = z.object({
  defaultProvider: z.string(),
  providers: z.record(z.string(), z.any())
});

export const BlogAgentConfigSchema = z.object({
  provider: z.string().optional()
}).default({});
