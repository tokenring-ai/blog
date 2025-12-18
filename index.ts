import {z} from "zod";

export const BlogConfigSchema = z.object({
  providers: z.record(z.string(), z.any())
}).optional();



export {default as BlogService} from "./BlogService.ts";