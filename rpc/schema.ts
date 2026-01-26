import {RPCSchema} from "@tokenring-ai/rpc/types";
import {z} from "zod";

const BlogPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string().optional(),
  status: z.enum(['draft', 'published', 'scheduled', 'pending', 'private']),
  tags: z.array(z.string()).optional(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  published_at: z.coerce.date().optional(),
  feature_image: z.object({
    id: z.string().optional(),
    url: z.string().optional(),
  }).optional(),
  url: z.string().optional(),
});

export default {
  name: "Blog RPC",
  path: "/rpc/blog",
  methods: {
    getCurrentPost: {
      type: "query",
      input: z.object({
        agentId: z.string(),
      }),
      result: z.object({
        post: BlogPostSchema.nullable(),
        message: z.string(),
      })
    },
    getAllPosts: {
      type: "query",
      input: z.object({
        agentId: z.string(),
        status: z.enum(["draft", "published", "all"]).default("all").optional(),
        tag: z.string().optional(),
        limit: z.number().int().positive().default(10).optional(),
      }),
      result: z.object({
        posts: z.array(BlogPostSchema),
        count: z.number(),
        currentlySelected: z.string().nullable(),
        message: z.string(),
      })
    },
    createPost: {
      type: "mutation",
      input: z.object({
        agentId: z.string(),
        title: z.string(),
        contentInMarkdown: z.string(),
        tags: z.array(z.string()).optional(),
      }),
      result: z.object({
        post: BlogPostSchema,
        message: z.string(),
      })
    },
    updatePost: {
      type: "mutation",
      input: z.object({
        agentId: z.string(),
        title: z.string().optional(),
        contentInMarkdown: z.string().optional(),
        tags: z.array(z.string()).optional(),
        status: z.enum(['draft', 'published', 'scheduled', 'pending', 'private']).optional(),
        feature_image: z.object({
          id: z.string().optional(),
          url: z.string().optional(),
        }).optional(),
      }),
      result: z.object({
        post: BlogPostSchema,
        message: z.string(),
      })
    },
    selectPostById: {
      type: "mutation",
      input: z.object({
        agentId: z.string(),
        id: z.string(),
      }),
      result: z.object({
        post: BlogPostSchema,
        message: z.string(),
      })
    },
    clearCurrentPost: {
      type: "mutation",
      input: z.object({
        agentId: z.string(),
      }),
      result: z.object({
        success: z.boolean(),
        message: z.string(),
      })
    },
    publishPost: {
      type: "mutation",
      input: z.object({
        agentId: z.string(),
      }),
      result: z.object({
        success: z.boolean(),
        message: z.string(),
      })
    },
    generateImageForPost: {
      type: "mutation",
      input: z.object({
        agentId: z.string(),
        prompt: z.string(),
        aspectRatio: z.enum(["square", "tall", "wide"]).default("square").optional(),
      }),
      result: z.object({
        success: z.boolean(),
        imageUrl: z.string().optional(),
        message: z.string(),
      })
    },
    getActiveProvider: {
      type: "query",
      input: z.object({
        agentId: z.string(),
      }),
      result: z.object({
        provider: z.string().nullable(),
        availableProviders: z.array(z.string()),
      })
    },
    setActiveProvider: {
      type: "mutation",
      input: z.object({
        agentId: z.string(),
        name: z.string(),
      }),
      result: z.object({
        success: z.boolean(),
        message: z.string(),
      })
    },
  }
} satisfies RPCSchema;
