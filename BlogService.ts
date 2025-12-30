import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingService} from "@tokenring-ai/app/types";
import KeyedRegistry from "@tokenring-ai/utility/registry/KeyedRegistry";
import {z} from "zod";
import {type BlogPost, BlogProvider, type CreatePostData, type UpdatePostData} from "./BlogProvider.js";
import {BlogAgentConfigSchema, BlogConfigSchema} from "./schema.ts";
import {BlogState} from "./state/BlogState.js";

export default class BlogService implements TokenRingService {
  name = "BlogService";
  description = "Abstract interface for blog operations";

  private providers = new KeyedRegistry<BlogProvider>();

  registerBlog = this.providers.register;
  getAvailableBlogs = this.providers.getAllItemNames;

  constructor(readonly options: z.output<typeof BlogConfigSchema>) {}
  
  async attach(agent: Agent): Promise<void> {
    const agentConfig = agent.getAgentConfigSlice('blog', BlogAgentConfigSchema);
    agent.initializeState(BlogState, agentConfig);
    for (const blog of this.providers.getAllItemValues()) {
      await blog.attach(agent);
    }
  }

  requireActiveBlogProvider(agent: Agent): BlogProvider {
    const activeProvider = agent.getState(BlogState).activeProvider ?? this.options.defaultProvider;
    return this.providers.requireItemByName(activeProvider);
  }

  setActiveProvider(name: string, agent: Agent): void {
    agent.mutateState(BlogState, (state) => {
      state.activeProvider = name;
    });
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