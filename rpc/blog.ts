import {AgentManager} from "@tokenring-ai/agent";
import {ImageGenerationModelRegistry} from "@tokenring-ai/ai-client/ModelRegistry";
import TokenRingApp from "@tokenring-ai/app";
import CDNService from "@tokenring-ai/cdn/CDNService";
import {createRPCEndpoint} from "@tokenring-ai/rpc/createRPCEndpoint";
import {marked} from "marked";
import {Buffer} from "node:buffer";
import {v4 as uuid} from "uuid";
import BlogService from "../BlogService.js";
import BlogRpcSchema from "./schema.ts";

export default createRPCEndpoint(BlogRpcSchema, {
  async getCurrentPost(args, app: TokenRingApp) {
    const agent = app.requireService(AgentManager).getAgent(args.agentId);
    if (!agent) throw new Error("Agent not found");
    const blogService = app.requireService(BlogService);
    const post = blogService.getCurrentPost(agent);

    if (!post) {
      return {
        post: null,
        message: "No post is currently selected",
      };
    }

    return {
      post,
      message: `Currently selected: "${post.title}" (${post.status})`,
    };
  },

  async getAllPosts(args, app: TokenRingApp) {
    const agent = app.requireService(AgentManager).getAgent(args.agentId);
    if (!agent) throw new Error("Agent not found");
    const blogService = app.requireService(BlogService);

    let posts = await blogService.getAllPosts(agent);

    if (args.status && args.status !== "all") {
      posts = posts.filter(post => post.status === args.status);
    }

    if (args.tag) {
      posts = posts.filter(post =>
        post.tags?.some(postTag => postTag === args.tag)
      );
    }

    const limit = args.limit || 10;
    const limitedPosts = posts.slice(0, limit);
    const currentPost = blogService.getCurrentPost(agent);

    return {
      posts: limitedPosts,
      count: posts.length,
      currentlySelected: currentPost?.id || null,
      message: `Found ${posts.length} posts${posts.length > limit ? `, showing ${limit}` : ""}`,
    };
  },

  async createPost(args, app: TokenRingApp) {
    const agent = app.requireService(AgentManager).getAgent(args.agentId);
    if (!agent) throw new Error("Agent not found");
    const blogService = app.requireService(BlogService);

    // Strip the header from the post
    let contentInMarkdown = args.contentInMarkdown;
    contentInMarkdown = contentInMarkdown.replace(/^\s*#.*/, "").trim();

    const post = await blogService.createPost({
      title: args.title,
      content: marked(contentInMarkdown, { async: false }),
      tags: args.tags,
    }, agent);

    return {
      post,
      message: `Post created with ID: ${post.id}`,
    };
  },

  async updatePost(args, app: TokenRingApp) {
    const agent = app.requireService(AgentManager).getAgent(args.agentId);
    if (!agent) throw new Error("Agent not found");
    const blogService = app.requireService(BlogService);

    const update: any = {};
    if (args.title) update.title = args.title;
    if (args.contentInMarkdown) {
      let contentInMarkdown = args.contentInMarkdown;
      contentInMarkdown = contentInMarkdown.replace(/^\s*#.*/, "").trim();
      update.content = marked(contentInMarkdown, { async: false });
    }
    if (args.tags) update.tags = args.tags;
    if (args.status) update.status = args.status;
    if (args.feature_image) update.feature_image = args.feature_image;

    const post = await blogService.updatePost(update, agent);

    return {
      post,
      message: `Post updated: ${post.id}`,
    };
  },

  async selectPostById(args, app: TokenRingApp) {
    const agent = app.requireService(AgentManager).getAgent(args.agentId);
    if (!agent) throw new Error("Agent not found");
    const blogService = app.requireService(BlogService);

    const post = await blogService.selectPostById(args.id, agent);

    return {
      post,
      message: `Selected post: "${post.title}"`,
    };
  },

  async clearCurrentPost(args, app: TokenRingApp) {
    const agent = app.requireService(AgentManager).getAgent(args.agentId);
    if (!agent) throw new Error("Agent not found");
    const blogService = app.requireService(BlogService);

    await blogService.clearCurrentPost(agent);

    return {
      success: true,
      message: "Post selection cleared. No post is currently selected.",
    };
  },

  async publishPost(args, app: TokenRingApp) {
    const agent = app.requireService(AgentManager).getAgent(args.agentId);
    if (!agent) throw new Error("Agent not found");
    const blogService = app.requireService(BlogService);

    const activeBlog = blogService.requireActiveBlogProvider(agent);
    const currentPost = activeBlog.getCurrentPost(agent);

    if (!currentPost) {
      return {
        success: false,
        message: "No post is currently selected.",
      };
    }

    if (currentPost.status === "published") {
      return {
        success: false,
        message: `Post "${currentPost.title}" is already published.`,
      };
    }

    await activeBlog.updatePost({ status: "published" }, agent);

    return {
      success: true,
      message: `Post "${currentPost.title}" has been published.`,
    };
  },

  async generateImageForPost(args, app: TokenRingApp) {
    const agent = app.requireService(AgentManager).getAgent(args.agentId);
    if (!agent) throw new Error("Agent not found");
    const blogService = app.requireService(BlogService);
    const cdnService = app.requireService(CDNService);
    const imageModelRegistry = app.requireService(ImageGenerationModelRegistry);

    if (!args.prompt) {
      throw new Error("Prompt is required");
    }

    const activeBlog = blogService.requireActiveBlogProvider(agent);
    const currentPost = activeBlog.getCurrentPost(agent);

    if (!currentPost) {
      throw new Error("No post currently selected");
    }

    const imageClient = await imageModelRegistry.getClient(activeBlog.imageGenerationModel);

    let size: `${number}x${number}`;
    const aspectRatio = args.aspectRatio || "square";
    switch (aspectRatio) {
      case "square": size = "1024x1024"; break;
      case "tall": size = "1024x1536"; break;
      case "wide": size = "1536x1024"; break;
      default: size = "1024x1024";
    }

    const [imageResult] = await imageClient.generateImage({prompt: args.prompt, size, n: 1}, agent);

    const extension = imageResult.mediaType.split("/")[1];
    const filename = `${uuid()}.${extension}`;
    const imageBuffer = Buffer.from(imageResult.uint8Array);

    const uploadResult = await cdnService.upload(activeBlog.cdnName, imageBuffer, {
      filename,
      contentType: imageResult.mediaType,
    });

    // Update the current post with the featured image
    await blogService.updatePost({
      feature_image: {
        id: uploadResult.id,
        url: uploadResult.url
      }
    }, agent);

    return {
      success: true,
      imageUrl: uploadResult.url,
      message: `Image generated and set as featured image for post "${currentPost.title}"`,
    };
  },

  async getActiveProvider(args, app: TokenRingApp) {
    const agent = app.requireService(AgentManager).getAgent(args.agentId);
    if (!agent) throw new Error("Agent not found");
    const blogService = app.requireService(BlogService);

    const activeProvider = blogService.getAvailableBlogs().length > 0
      ? blogService.requireActiveBlogProvider(agent)?.description || null
      : null;
    const availableProviders = blogService.getAvailableBlogs();

    return {
      provider: activeProvider,
      availableProviders,
    };
  },

  async setActiveProvider(args, app: TokenRingApp) {
    const agent = app.requireService(AgentManager).getAgent(args.agentId);
    if (!agent) throw new Error("Agent not found");
    const blogService = app.requireService(BlogService);

    const availableBlogs = blogService.getAvailableBlogs();
    if (availableBlogs.includes(args.name)) {
      blogService.setActiveProvider(args.name, agent);
      return {
        success: true,
        message: `Active provider set to: ${args.name}`,
      };
    } else {
      return {
        success: false,
        message: `Provider "${args.name}" not found. Available providers: ${availableBlogs.join(", ")}`,
      };
    }
  },
});
