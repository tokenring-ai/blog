import type {RPCSchema} from "@tokenring-ai/rpc/types";
import {z} from "zod";
import {BlogPostListItemSchema, BlogPostSchema} from "../BlogProvider.ts";

export default {
  name: "Blog RPC",
  path: "/rpc/blog",
  methods: {
    getAllPosts: {
      type: "query",
      input: z.object({
        provider: z.string(),
        status: z.enum(["draft", "published", "all"]).default("all").optional(),
        tag: z.string().optional(),
        limit: z.number().int().positive().default(10).optional(),
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
        tags: z.array(z.string()).optional(),
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
      result: z.object({
        selectedPostId: z.string().nullable(),
        selectedProvider: z.string().nullable(),
        availableProviders: z.array(z.string()),
      }),
    },
    updateBlogState: {
      type: "mutation",
      input: z.object({
        agentId: z.string(),
        selectedPostId: z.string().optional(),
        selectedProvider: z.string().optional(),
      }),
      result: z.object({
        selectedPostId: z.string().nullable(),
        selectedProvider: z.string().nullable(),
        availableProviders: z.array(z.string()),
      }),
    },
  },
} satisfies RPCSchema;
