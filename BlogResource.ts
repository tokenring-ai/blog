import {Agent} from "@tokenring-ai/agent";

export interface BlogPost {
  id: string;
  title: string;
  content?: string;
  status: 'draft' | 'published' | 'scheduled';
  tags?: string[];
  created_at: Date;
  updated_at: Date;
  published_at?: Date;
  feature_image?: string;
  url?: string;
}

export type CreatePostData = Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'published_at'>;

export type UpdatePostData = Partial<Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>>;

export interface BlogResourceOptions {
  imageGenerationModel: string;
  cdn: string;
}

export default class BlogResource {
  imageGenerationModel: string;
  cdnName: string;

  constructor({imageGenerationModel, cdn}: BlogResourceOptions) {
    this.imageGenerationModel = imageGenerationModel;
    this.cdnName = cdn;
  }


  async getAllPosts(agent: Agent): Promise<BlogPost[]> {
    throw new Error("Method 'getAllPosts' must be implemented by subclasses");
  }

  async createPost(_data: CreatePostData,agent: Agent): Promise<BlogPost> {
    throw new Error("Method 'createPost' must be implemented by subclasses");
  }

  async updatePost(_data: UpdatePostData,agent: Agent): Promise<BlogPost> {
    throw new Error("Method 'updatePost' must be implemented by subclasses");
  }

  async selectPostById(_id: string,agent: Agent): Promise<BlogPost> {
    throw new Error("Method 'selectPostById' must be implemented by subclasses");
  }

  getCurrentPost(agent: Agent): BlogPost | null {
    throw new Error("Method 'getCurrentPost' must be implemented by subclasses");
  }

  async clearCurrentPost(agent: Agent): Promise<void> {
    throw new Error("Method 'clearCurrentPost' must be implemented by subclasses");
  }
}