import {z} from "zod";

export const BlogAgentConfigSchema = z.object({
  provider: z.string().optional()
}).default({});

export const BlogConfigSchema = z.object({
  providers: z.record(z.string(), z.any()),
  agentDefaults: BlogAgentConfigSchema,
});
