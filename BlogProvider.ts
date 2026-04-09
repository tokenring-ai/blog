import {z} from "zod";

export const BlogPostStatusSchema = z.enum(['draft', 'published', 'scheduled', 'pending', 'private']);

export const BlogPostListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: BlogPostStatusSchema,
  tags: z.array(z.string()).optional(),
  created_at: z.number(), // Unix timestamp in milliseconds
  updated_at: z.number(),
  published_at: z.number().optional(),
  feature_image: z.object({
    id: z.string().optional(),
    url: z.string().optional(),
  }).optional(),
  url: z.string().optional(),
});
export type BlogPostListItem = z.infer<typeof BlogPostListItemSchema>;


export const BlogPostSchema = BlogPostListItemSchema.extend({
  html: z.string(),
});

export type BlogPost = z.infer<typeof BlogPostSchema>;

export const CreatePostDataSchema = BlogPostSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  published_at: true,
  status: true,
});

export type CreatePostData = z.infer<typeof CreatePostDataSchema>;

export const UpdatePostDataSchema = BlogPostSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).partial();

export type UpdatePostData = z.infer<typeof UpdatePostDataSchema>;

export const BlogPostFilterOptionsSchema = z.object({
  keyword: z.string().optional(),
  limit: z.number().optional(),
  status: BlogPostStatusSchema.optional(),
});

export type BlogPostFilterOptions = z.infer<typeof BlogPostFilterOptionsSchema>;

export interface BlogProvider {
  description: string;

  cdnName: string;

  getAllPosts(): Promise<BlogPostListItem[]>;

  getRecentPosts(filter: BlogPostFilterOptions): Promise<BlogPostListItem[]>;

  createPost(data: CreatePostData): Promise<BlogPost>;

  updatePost(id: string, updatedData: UpdatePostData): Promise<BlogPost>;

  getPostById(id: string): Promise<BlogPost>;
}