import {AgentManager} from "@tokenring-ai/agent";
import TokenRingApp from "@tokenring-ai/app";
import {createRPCEndpoint} from "@tokenring-ai/rpc/createRPCEndpoint";
import {marked} from "marked";
import BlogService from "../BlogService.ts";
import {BlogState} from "../state/BlogState.ts";
import BlogRpcSchema from "./schema.ts";

export default createRPCEndpoint(BlogRpcSchema, {
  async getAllPosts(args, app: TokenRingApp) {
    const blogService = app.requireService(BlogService);
    const blogProvider = blogService.requireBlogProvider(args.provider);

    let posts = await blogProvider.getAllPosts();

    if (args.status && args.status !== "all") {
      posts = posts.filter(post => post.status === args.status);
    }

    if (args.tag) {
      posts = posts.filter(post => post.tags?.some(t => t === args.tag));
    }

    const limit = args.limit || 10;
    const limitedPosts = posts.slice(0, limit);

    return {
      posts: limitedPosts,
      count: posts.length,
      currentlySelected: null,
      message: `Found ${posts.length} posts${posts.length > limit ? `, showing ${limit}` : ""}`,
    };
  },

  async createPost(args, app: TokenRingApp) {
    const blogService = app.requireService(BlogService);
    const blogProvider = blogService.requireBlogProvider(args.provider);

    let contentInMarkdown = args.contentInMarkdown.replace(/^\s*#.*/, "").trim();

    const post = await blogProvider.createPost({
      title: args.title,
      html: marked(contentInMarkdown, {async: false}),
      tags: args.tags,
    });

    return {
      post,
      message: `Post created with ID: ${post.id}`,
    };
  },

  async updatePost(args, app: TokenRingApp) {
    const blogService = app.requireService(BlogService);
    const blogProvider = blogService.requireBlogProvider(args.provider);

    const post = await blogProvider.updatePost(args.id, args.updatedData);

    return {
      post,
      message: `Post updated: ${post.id}`,
    };
  },

  async getPostById(args, app: TokenRingApp) {
    const blogService = app.requireService(BlogService);
    const blogProvider = blogService.requireBlogProvider(args.provider);

    const post = await blogProvider.getPostById(args.id);

    return {
      post,
      message: `Post: "${post.title}"`,
    };
  },

  async getBlogState(args, app: TokenRingApp) {
    const agent = app.requireService(AgentManager).getAgent(args.agentId);
    if (!agent) throw new Error("Agent not found");
    const blogService = app.requireService(BlogService);

    const currentPost = blogService.getCurrentPost(agent);
    const state = agent.getState(BlogState);

    return {
      selectedPostId: currentPost?.id ?? null,
      selectedProvider: state.activeProvider ?? null,
      availableProviders: blogService.getAvailableBlogs(),
    };
  },

  async updateBlogState(args, app: TokenRingApp) {
    const agent = app.requireService(AgentManager).getAgent(args.agentId);
    if (!agent) throw new Error("Agent not found");
    const blogService = app.requireService(BlogService);

    if (args.selectedProvider) {
      blogService.setActiveProvider(args.selectedProvider, agent);
    }

    if (args.selectedPostId) {
      await blogService.selectPostById(args.selectedPostId, agent);
    }

    const state = agent.getState(BlogState);
    const currentPost = blogService.getCurrentPost(agent);

    return {
      selectedPostId: currentPost?.id ?? null,
      selectedProvider: state.activeProvider ?? null,
      availableProviders: blogService.getAvailableBlogs(),
    };
  },
});
