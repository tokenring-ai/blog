export interface BlogPost {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'published';
  tags?: string[];
  created_at: string;
  updated_at: string;
  url?: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  tags?: string[];
  published?: boolean;
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  tags?: string[];
}

export interface PublishResult {
  success: boolean;
  post?: BlogPost;
  message?: string;
}

export interface BlogServiceOptions {
  imageGenerationModel: string;
  cdn: string;
}

export default class BlogResource {
  imageGenerationModel: string;
  cdnName: string;

  constructor({imageGenerationModel, cdn}: BlogServiceOptions) {
    this.imageGenerationModel = imageGenerationModel;
    this.cdnName = cdn;
  }

  async getAllPosts(): Promise<BlogPost[]> {
    throw new Error("Method 'getAllPosts' must be implemented by subclasses");
  }

  async createPost(_data: CreatePostData): Promise<BlogPost> {
    throw new Error("Method 'createPost' must be implemented by subclasses");
  }

  async updatePost(_data: UpdatePostData): Promise<BlogPost> {
    throw new Error("Method 'updatePost' must be implemented by subclasses");
  }

  async selectPostById(_id: string): Promise<BlogPost> {
    throw new Error("Method 'selectPostById' must be implemented by subclasses");
  }

  getCurrentPost(): BlogPost | null {
    throw new Error("Method 'getCurrentPost' must be implemented by subclasses");
  }

  setCurrentPost(_post: BlogPost | null): void {
    throw new Error("Method 'setCurrentPost' must be implemented by subclasses");
  }
}