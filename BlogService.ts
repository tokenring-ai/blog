import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingService} from "@tokenring-ai/app/types";
import KeyedRegistry from "@tokenring-ai/utility/registry/KeyedRegistry";
import {type BlogPost, BlogProvider, type CreatePostData, type UpdatePostData} from "./BlogProvider.js";
import {BlogState} from "./state/BlogState.js";

export default class BlogService implements TokenRingService {
  name = "BlogService";
  description = "Abstract interface for blog operations";

  private providers = new KeyedRegistry<BlogProvider>();

  registerBlog = this.providers.register;
  getAvailableBlogs = this.providers.getAllItemNames;
  
  async attach(agent: Agent): Promise<void> {
    agent.initializeState(BlogState, {});
    for (const blog of this.providers.getAllItemValues()) {
      await blog.attach(agent);
    }
  }

  requireActiveBlogProvider(agent: Agent): BlogProvider {
    const { activeBlogName } = agent.getState(BlogState);
    if (!activeBlogName) {
      throw new Error("No active blog selected. Use /blog blog select first.");
    }
    const activeBlog = this.providers.getItemByName(activeBlogName);
    if (!activeBlog) {
      throw new Error(`Blog provider "${activeBlogName}" not found`);
    }
    return activeBlog;
  }

  async getAllPosts(agent: Agent): Promise<BlogPost[]> {
    const activeBlog = this.requireActiveBlogProvider(agent);
    return activeBlog.getAllPosts(agent);
  }

  async createPost(data: CreatePostData, agent: Agent): Promise<BlogPost> {
    const activeBlog = this.requireActiveBlogProvider(agent);
    return activeBlog.createPost(data,agent);
  }

  async updatePost(data: UpdatePostData, agent: Agent): Promise<BlogPost> {
    const activeBlog = this.requireActiveBlogProvider(agent)
    return activeBlog.updatePost(data,agent);
  }

  getCurrentPost(agent: Agent): BlogPost | null {
    const activeBlog = this.requireActiveBlogProvider(agent)
    return activeBlog.getCurrentPost(agent);
  }

  async selectPostById(id: string,agent: Agent): Promise<BlogPost> {
    const activeBlog = this.requireActiveBlogProvider(agent)
    return await activeBlog.selectPostById(id,agent);
  }

  async clearCurrentPost(agent: Agent): Promise<void> {
    const activeBlog = this.requireActiveBlogProvider(agent)
    return await activeBlog.clearCurrentPost(agent);
  }

  async publishPost(agent: Agent): Promise<void> {
    const activeBlog = this.requireActiveBlogProvider(agent)

    const currentPost = activeBlog.getCurrentPost(agent);
    if (!currentPost) {
      agent.infoLine("No post is currently selected.");
      agent.infoLine("Use /blog post select to choose a post.");
      return;
    }

    if (currentPost.status === "published") {
      agent.infoLine(`Post "${currentPost.title}" is already published.`);
      return;
    }

    await activeBlog.updatePost({ status: "published" }, agent);
    agent.infoLine(`Post "${currentPost.title}" has been published.`);
  }
}