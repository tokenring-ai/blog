import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingService} from "@tokenring-ai/app/types";
import type {CommunicationChannel} from "@tokenring-ai/escalation/EscalationProvider";
import {EscalationService} from "@tokenring-ai/escalation";
import deepMerge from "@tokenring-ai/utility/object/deepMerge";
import KeyedRegistry from "@tokenring-ai/utility/registry/KeyedRegistry";
import {z} from "zod";
import {type BlogPost, type BlogPostFilterOptions, BlogProvider, type CreatePostData, type UpdatePostData} from "./BlogProvider.js";
import {BlogAgentConfigSchema, BlogConfigSchema} from "./schema.ts";
import {BlogState} from "./state/BlogState.js";

export default class BlogService implements TokenRingService {
  readonly name = "BlogService";
  description = "Abstract interface for blog operations";

  private providers = new KeyedRegistry<BlogProvider>();

  registerBlog = this.providers.register;
  getAvailableBlogs = this.providers.getAllItemNames;

  constructor(readonly options: z.output<typeof BlogConfigSchema>) {}
  
  attach(agent: Agent): void {
    const agentConfig = deepMerge(this.options.agentDefaults, agent.getAgentConfigSlice('blog', BlogAgentConfigSchema));
    agent.initializeState(BlogState, agentConfig);
    for (const blog of this.providers.getAllItemValues()) {
      blog?.attach(agent);
    }
  }

  requireActiveBlogProvider(agent: Agent): BlogProvider {
    const activeProvider = agent.getState(BlogState).activeProvider;
    if (!activeProvider) throw new Error("No blog provider is currently selected");
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

  async getRecentPosts(filter: BlogPostFilterOptions, agent: Agent): Promise<BlogPost[]> {
    const activeBlog = this.requireActiveBlogProvider(agent);
    return activeBlog.getRecentPosts(filter, agent);
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
    const activeProvider = agent.getState(BlogState).activeProvider;
    if (!activeProvider) return null;
    
    const activeBlog = this.providers.getItemByName(activeProvider);
    if (!activeBlog) return null;
    
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
      agent.infoMessage("No post is currently selected.");
      agent.infoMessage("Use /blog post select to choose a post.");
      return;
    }

    if (currentPost.status === "published") {
      agent.infoMessage(`Post "${currentPost.title}" is already published.`);
      //return;
    }

    const state = agent.getState(BlogState);
    
    // Check review patterns
    if (state.reviewPatterns && state.reviewPatterns.length > 0 && currentPost.content) {
      for (const pattern of state.reviewPatterns) {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(currentPost.content)) {
          agent.infoMessage(`Post "${currentPost.title}" requires review (matched pattern: ${pattern})`);
          
          if (state.reviewEscalationTarget) {
            const escalationService = agent.requireServiceByType(EscalationService);

            if (escalationService) {
              const message = `
Post "${currentPost.title}" matched pattern: ${pattern} and requires review before publishing.
URL: ${currentPost.url || 'N/A'}
To publish this post, please reply with "approve" or "reject".
              `.trim();

              const channel: CommunicationChannel = await escalationService.initiateContactWithUser(state.reviewEscalationTarget, agent);

              await channel.send(message);
              agent.infoMessage(`Escalation sent to ${state.reviewEscalationTarget}`);

              for await (const response of channel.receive()) {
                switch (response.trim().toLowerCase()) {
                  case "approve": {
                    await activeBlog.updatePost({status: "published"}, agent);
                    agent.infoMessage(`Post "${currentPost.title}" has been published.`);
                    await channel.send(`Post "${currentPost.title}" has been published.`);
                    await channel.close();
                  } break;
                  case "reject": {
                    agent.infoMessage(`Post "${currentPost.title}" has not been published.`);
                    await channel.send(`Post "${currentPost.title}" has not been published.`);
                    await channel.close();
                  } break;
                  default:
                    agent.infoMessage(`Unknown response received: ${response}`);
                    await channel.send(`The only valid responses are "approve" or "reject". Please try again.`);
                }
              }
            }
          } else {
            agent.infoMessage("No escalation target configured, post will require manual review.");
          }
          return;
        }
      }
    }

    await activeBlog.updatePost({ status: "published" }, agent);
    agent.infoMessage(`Post "${currentPost.title}" has been published.`);
  }
}
