import { AgentNotFoundSchema } from "@tokenring-ai/agent/schema";
import type { RPCSchema } from "@tokenring-ai/rpc/types";
import { z } from "zod";
import { BlogPostListItemSchema, BlogPostSchema } from "../BlogProvider.ts";

export default {
  name: "Blog RPC",
  path: "/rpc/blog",
  methods: {
    getAllPosts: {
      type: "query",
      input: z.object({
        provider: z.string(),
        status: z.enum(["draft", "published", "all"]).default("all").exactOptional(),
        tag: z.string().exactOptional(),
        limit: z.number().int().positive().default(10).exactOptional(),
      }),
      result: z.object({
        posts: z.array(BlogPostListItemSchema),
        count: z.number(),
        currentlySelected: z.string().nullable(),
        message: z.string(),
      }),
    },
    createPost: {
      type: "mutation",
      input: z.object({
        provider: z.string(),
        title: z.string(),
        contentInMarkdown: z.string(),
        tags: z.array(z.string()).exactOptional(),
      }),
      result: z.object({
        post: BlogPostSchema,
        message: z.string(),
      }),
    },
    updatePost: {
      type: "mutation",
      input: z.object({
        provider: z.string(),
        id: z.string(),
        updatedData: BlogPostSchema.omit(["id"]).partial(),
      }),
      result: z.object({
        post: BlogPostSchema,
        message: z.string(),
      }),
    },
    getPostById: {
      type: "query",
      input: z.object({
        provider: z.string(),
        id: z.string(),
      }),
      result: z.object({
        post: BlogPostSchema,
        message: z.string(),
      }),
    },
    getBlogState: {
      type: "query",
      input: z.object({
        agentId: z.string(),
      }),
      result: z.discriminatedUnion("status", [
        z.object({
          status: z.literal("success"),
          selectedPostId: z.string().nullable(),
          selectedProvider: z.string().nullable(),
          availableProviders: z.array(z.string()),
        }),
        AgentNotFoundSchema,
      ]),
    },
    updateBlogState: {
      type: "mutation",
      input: z.object({
        agentId: z.string(),
        selectedPostId: z.string().exactOptional(),
        selectedProvider: z.string().exactOptional(),
      }),
      result: z.discriminatedUnion("status", [
        z.object({
          status: z.literal("success"),
          selectedPostId: z.string().nullable(),
          selectedProvider: z.string().nullable(),
          availableProviders: z.array(z.string()),
        }),
        AgentNotFoundSchema,
      ]),
    },
  },
} satisfies RPCSchema;
