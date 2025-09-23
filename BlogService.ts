import Agent from "@tokenring-ai/agent/Agent";
import {ContextItem, TokenRingService} from "@tokenring-ai/agent/types";
import KeyedRegistry from "@tokenring-ai/utility/KeyedRegistry";
import {type BlogPost, BlogResource, type CreatePostData, type UpdatePostData} from "./BlogResource.js";
import {BlogState} from "./state/BlogState.js";

export default class BlogService implements TokenRingService {
  name = "BlogService";
  description = "Abstract interface for blog operations";

  private blogResourceRegistry = new KeyedRegistry<BlogResource>();

  registerBlog = this.blogResourceRegistry.register;
  getAvailableBlogs = this.blogResourceRegistry.getAllItemNames;
  
  async attach(agent: Agent): Promise<void> {
    agent.initializeState(BlogState, {});
    for (const blog of this.blogResourceRegistry.getAllItemValues()) {
      await blog.attach(agent);
    }
  }

  requireActiveBlogResource(agent: Agent): BlogResource {
    const { activeBlogName } = agent.getState(BlogState);
    if (!activeBlogName) {
      throw new Error("No active blog selected. Use /blog blog select first.");
    }
    const activeBlog = this.blogResourceRegistry.getItemByName(activeBlogName);
    if (!activeBlog) {
      throw new Error(`Blog resource "${activeBlogName}" not found`);
    }
    return activeBlog;
  }

  async getAllPosts(agent: Agent): Promise<BlogPost[]> {
    const activeBlog = this.requireActiveBlogResource(agent);
    return activeBlog.getAllPosts(agent);
  }

  async createPost(data: CreatePostData, agent: Agent): Promise<BlogPost> {
    const activeBlog = this.requireActiveBlogResource(agent);
    return activeBlog.createPost(data,agent);
  }

  async updatePost(data: UpdatePostData, agent: Agent): Promise<BlogPost> {
    const activeBlog = this.requireActiveBlogResource(agent)
    return activeBlog.updatePost(data,agent);
  }

  getCurrentPost(agent: Agent): BlogPost | null {
    const activeBlog = this.requireActiveBlogResource(agent)
    return activeBlog.getCurrentPost(agent);
  }

  async selectPostById(id: string,agent: Agent): Promise<BlogPost> {
    const activeBlog = this.requireActiveBlogResource(agent)
    return await activeBlog.selectPostById(id,agent);
  }

  async clearCurrentPost(agent: Agent): Promise<void> {
    const activeBlog = this.requireActiveBlogResource(agent)
    return await activeBlog.clearCurrentPost(agent);
  }


  async* getContextItems(agent: Agent): AsyncGenerator<ContextItem> {
    if (agent.tools.hasItemLike(/@tokenring-ai\/blog/)) {

      yield {
        position: "afterSystemMessage",
        role: "user",
        content: `/* The following blogs are available for use with the blog tool */` +
          Object.entries(this.blogResourceRegistry.getAllItems()).map(([name, blog]) =>
            `- ${name}: ${blog.description}`
          ).join("\n")
      };
    }
  }
}