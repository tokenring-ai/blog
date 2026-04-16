import type Agent from "@tokenring-ai/agent/Agent";
import type {AgentCreationContext} from "@tokenring-ai/agent/types";
import type {TokenRingService} from "@tokenring-ai/app/types";
import {EscalationService} from "@tokenring-ai/escalation";
import type {CommunicationChannel} from "@tokenring-ai/escalation/EscalationProvider";
import deepMerge from "@tokenring-ai/utility/object/deepMerge";
import KeyedRegistry from "@tokenring-ai/utility/registry/KeyedRegistry";
import type {z} from "zod";
import type {BlogPost, BlogPostFilterOptions, BlogPostListItem, BlogProvider, CreatePostData, UpdatePostData} from "./BlogProvider.ts";
import {BlogAgentConfigSchema, type BlogConfigSchema} from "./schema.ts";
import {BlogState} from "./state/BlogState.ts";

export default class BlogService implements TokenRingService {
  readonly name = "BlogService";
  description = "Abstract interface for blog operations";

  private providers = new KeyedRegistry<BlogProvider>();

  registerBlog = this.providers.set;
  getAvailableBlogs = this.providers.keysArray;
  getBlogProvider = this.providers.get;
  requireBlogProvider = this.providers.require;

  constructor(readonly options: z.output<typeof BlogConfigSchema>) {
  }

  attach(agent: Agent, creationContext: AgentCreationContext): void {
    const agentConfig = deepMerge(
      this.options.agentDefaults,
      agent.getAgentConfigSlice("blog", BlogAgentConfigSchema),
    );
    const initialState = agent.initializeState(BlogState, agentConfig);
    creationContext.items.push(
      `Selected blog provider: ${initialState.activeProvider ?? "(none)"}`,
    );
  }

  requireActiveBlogProvider(agent: Agent): BlogProvider {
    const activeProvider = agent.getState(BlogState).activeProvider;
    if (!activeProvider)
      throw new Error("No blog provider is currently selected");
    return this.providers.require(activeProvider);
  }

  setActiveProvider(name: string, agent: Agent): void {
    agent.mutateState(BlogState, (state) => {
      state.activeProvider = name;
    });
  }

  getAllPosts(agent: Agent): Promise<BlogPostListItem[]> {
    const activeBlog = this.requireActiveBlogProvider(agent);
    return activeBlog.getAllPosts();
  }

  getRecentPosts(
    filter: BlogPostFilterOptions,
    agent: Agent,
  ): Promise<BlogPostListItem[]> {
    const activeBlog = this.requireActiveBlogProvider(agent);
    return activeBlog.getRecentPosts(filter);
  }

  createPost(data: CreatePostData, agent: Agent): Promise<BlogPost> {
    const activeBlog = this.requireActiveBlogProvider(agent);
    return activeBlog.createPost(data);
  }

  async updateCurrentPost(
    updatedData: UpdatePostData,
    agent: Agent,
  ): Promise<BlogPost> {
    const activeBlog = this.requireActiveBlogProvider(agent);
    const currentPost = agent.getState(BlogState).currentPost;
    if (!currentPost) throw new Error(`No post is currently selected.`);

    const updatedPost = await activeBlog.updatePost(
      currentPost.id,
      updatedData,
    );
    agent.mutateState(BlogState, (state) => {
      state.currentPost = updatedPost;
    });
    return updatedPost;
  }

  getCurrentPost(agent: Agent): BlogPost | null {
    return agent.getState(BlogState).currentPost ?? null;
  }

  async selectPostById(id: string, agent: Agent): Promise<BlogPost> {
    const activeBlog = this.requireActiveBlogProvider(agent);
    const selectedPost = await activeBlog.getPostById(id);
    if (!selectedPost) throw new Error(`Post with ID ${id} not found`);
    agent.mutateState(BlogState, (state) => {
      state.currentPost = selectedPost;
    });
    return selectedPost;
  }

  clearCurrentPost(agent: Agent): void {
    agent.mutateState(BlogState, (state) => {
      state.currentPost = undefined;
    });
  }

  async publishPost(agent: Agent): Promise<void> {
    const activeBlog = this.requireActiveBlogProvider(agent);

    const currentPost = agent.getState(BlogState).currentPost;
    if (!currentPost) {
      agent.infoMessage("No post is currently selected.");
      agent.infoMessage("Use /blog post select to choose a post.");
      return;
    }

    const state = agent.getState(BlogState);

    // Check review patterns
    if (
      state.reviewPatterns &&
      state.reviewPatterns.length > 0 &&
      currentPost.html
    ) {
      for (const pattern of state.reviewPatterns) {
        const regex = new RegExp(pattern, "i");
        if (regex.test(currentPost.html)) {
          agent.infoMessage(
            `Post "${currentPost.title}" requires review (matched pattern: ${pattern})`,
          );

          if (state.reviewEscalationTarget) {
            const escalationService =
              agent.requireServiceByType(EscalationService);

            if (escalationService) {
              const message = `
Post "${currentPost.title}" matched pattern: ${pattern} and requires review before publishing.
URL: ${currentPost.url || "N/A"}
To publish this post, please reply with "approve" or "reject".
              `.trim();

                await using channel: CommunicationChannel =
                  await escalationService.initiateContactWithUser(
                    state.reviewEscalationTarget,
                    agent,
                  );

              await channel.send(message);
              agent.infoMessage(
                `Escalation sent to ${state.reviewEscalationTarget}`,
              );

              for await (const response of channel.receive()) {
                switch (response.trim().toLowerCase()) {
                  case "approve": {
                    await activeBlog.updatePost(currentPost.id, {
                      status: "published",
                    });
                    agent.infoMessage(
                      `Post "${currentPost.title}" has been published.`,
                    );
                    await channel.send(
                      `Post "${currentPost.title}" has been published.`,
                    );
                    return;
                  }
                  case "reject": {
                    agent.infoMessage(
                      `Post "${currentPost.title}" has not been published.`,
                    );
                    await channel.send(
                      `Post "${currentPost.title}" has not been published.`,
                    );
                    return;
                  }
                  default:
                    agent.infoMessage(`Unknown response received: ${response}`);
                    await channel.send(
                      `The only valid responses are "approve" or "reject". Please try again.`,
                    );
                }
              }
            }
          } else {
            agent.infoMessage(
              "No escalation target configured, post will require manual review.",
            );
          }
          return;
        }
      }
    }

    await activeBlog.updatePost(currentPost.id, {status: "published"});
    agent.infoMessage(`Post "${currentPost.title}" has been published.`);
  }
}
