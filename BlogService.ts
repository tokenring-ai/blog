import {type Registry, Service} from "@token-ring/registry";
import BlogResource, {type BlogPost, type CreatePostData, type UpdatePostData} from "./BlogResource.js";

export default class BlogService extends Service {
  name = "Blog";
  description = "Abstract interface for blog operations";
  protected registry!: Registry;

  private resources: Record<string, BlogResource> = {};
  private activeBlog: string | null = null;

  registerBlog(name: string, resource: BlogResource) {
    this.resources[name] = resource;
    if (!this.activeBlog) {
      this.activeBlog = name;
    }
  }

  getActiveBlog() : string | null {
    return this.activeBlog;
  }

  setActiveBlog(name: string): void {
    if (!this.resources[name]) {
      throw new Error(`Blog ${name} not found`);
    }
    this.activeBlog = name;
  }

  getAvailableBlogs(): string[] {
    return Object.keys(this.resources);
  }

  getBlogByName(blogName: string): BlogResource {
    if (this.resources[blogName]) {
      return this.resources[blogName];
    }
    throw new Error(
      `Blog ${blogName} not found. Available blogs: ${Object.keys(this.resources).join(", ")}`
    );
  }

  async getAllPosts(): Promise<BlogPost[]> {
    const blogName = this.getActiveBlog();
    if (!blogName) {
      throw new Error("No active blog selected. Use /blog blog select first.");
    }
    const activeBlog = this.getBlogByName(blogName);
    if (!activeBlog) {
      throw new Error("No active blog selected. Use /blog blog select first.");
    }

    return activeBlog.getAllPosts();
  }

  async createPost(data: CreatePostData): Promise<BlogPost> {
    const blogName = this.getActiveBlog();
    if (!blogName) {
      throw new Error("No active blog selected. Use /blog blog select first.");
    }
    const activeBlog = this.getBlogByName(blogName);
    if (!activeBlog) {
      throw new Error("No active blog selected. Use /blog blog select first.");
    }
    return activeBlog.createPost(data);
  }

  async updatePost(data: UpdatePostData): Promise<BlogPost> {
    const blogName = this.getActiveBlog();
    if (!blogName) {
      throw new Error("No active blog selected. Use /blog blog select first.");
    }
    const activeBlog = this.getBlogByName(blogName);
    if (!activeBlog) {
      throw new Error("No active blog selected. Use /blog blog select first.");
    }
    return activeBlog.updatePost(data);
  }

  getCurrentPost(): BlogPost | null {
    const blogName = this.getActiveBlog();
    if (!blogName) {
      throw new Error("No active blog selected. Use /blog blog select first.");
    }
    const activeBlog = this.getBlogByName(blogName);
    if (!activeBlog) {
      throw new Error("No active blog selected. Use /blog blog select first.");
    }
    return activeBlog.getCurrentPost();
  }

  setCurrentPost(post: BlogPost | null): void {
    const blogName = this.getActiveBlog();
    if (!blogName) {
      throw new Error("No active blog selected. Use /blog blog select first.");
    }
    const activeBlog = this.getBlogByName(blogName);
    if (!activeBlog) {
      throw new Error("No active blog selected. Use /blog blog select first.");
    }
    return activeBlog.setCurrentPost(post);
  }
}