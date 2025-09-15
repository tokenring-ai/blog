import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingService} from "@tokenring-ai/agent/types";
import KeyedRegistryWithSingleSelection from "@tokenring-ai/utility/KeyedRegistryWithSingleSelection";
import BlogResource, {type BlogPost, type CreatePostData, type UpdatePostData} from "./BlogResource.js";

export default class BlogService implements TokenRingService {
  name = "Blog";
  description = "Abstract interface for blog operations";

  private blogResourceRegistry = new KeyedRegistryWithSingleSelection<BlogResource>();

  registerBlog = this.blogResourceRegistry.register;
  getActiveBlogName = this.blogResourceRegistry.getActiveItemName;
  getActiveBlog = this.blogResourceRegistry.getActiveItem;
  setActiveBlogName = this.blogResourceRegistry.setEnabledItem;
  getAvailableBlogs = this.blogResourceRegistry.getAllItemNames;

  private getActiveBlogResource(): BlogResource {
    const blogName = this.getActiveBlogName();
    if (!blogName) {
      throw new Error("No active blog selected. Use /blog blog select first.");
    }
    return this.blogResourceRegistry.getActiveItem();
  }

  async getAllPosts(agent: Agent): Promise<BlogPost[]> {
    const activeBlog = this.getActiveBlogResource();
    return activeBlog.getAllPosts(agent);
  }

  async createPost(data: CreatePostData, agent: Agent): Promise<BlogPost> {
    const activeBlog = this.getActiveBlogResource();
    return activeBlog.createPost(data,agent);
  }

  async updatePost(data: UpdatePostData, agent: Agent): Promise<BlogPost> {
    const activeBlog = this.getActiveBlogResource();
    return activeBlog.updatePost(data,agent);
  }

  getCurrentPost(agent: Agent): BlogPost | null {
    const activeBlog = this.getActiveBlogResource();
    return activeBlog.getCurrentPost(agent);
  }

  async selectPostById(id: string,agent: Agent): Promise<BlogPost> {
    const activeBlog = this.getActiveBlogResource();
    return await activeBlog.selectPostById(id,agent);
  }

  async clearCurrentPost(agent: Agent): Promise<void> {
    const activeBlog = this.getActiveBlogResource();
    return await activeBlog.clearCurrentPost(agent);
  }
}