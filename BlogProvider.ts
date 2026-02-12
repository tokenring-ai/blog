import {Agent} from "@tokenring-ai/agent";

export interface BlogPost {
  id: string;
  title: string;
  content?: string;
  status: 'draft' | 'published' | 'scheduled' | 'pending' | 'private';
  tags?: string[];
  created_at: Date;
  updated_at: Date;
  published_at?: Date;
  feature_image?: {
    id?: string;
    url?: string;
  }
  url?: string;
}

export type CreatePostData = Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'published_at' | 'status'>;

export type UpdatePostData = Partial<Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>>;

export type BlogPostFilterOptions = {
  keyword?: string;
  limit?: number;
  status?: 'draft' | 'published' | 'scheduled' | 'pending' | 'private';
}

export interface BlogProvider {
  description: string;
  
  imageGenerationModel: string;
  cdnName: string;

  attach(agent: Agent): void;

  getAllPosts(agent: Agent): Promise<BlogPost[]>;

  getRecentPosts(filter: BlogPostFilterOptions, agent: Agent): Promise<BlogPost[]>;

  createPost(data: CreatePostData, agent: Agent): Promise<BlogPost>;

  updatePost(data: UpdatePostData, agent: Agent): Promise<BlogPost>;

  selectPostById(id: string, agent: Agent): Promise<BlogPost>;

  getCurrentPost(agent: Agent): BlogPost | null;

  clearCurrentPost(agent: Agent): Promise<void>;
}