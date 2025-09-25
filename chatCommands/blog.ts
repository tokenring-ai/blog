import Agent from "@tokenring-ai/agent/Agent";
import type {BlogPost} from "../BlogProvider.ts";
import BlogService from "../BlogService.ts";
import {BlogState} from "../state/BlogState.js";

export const description = "/blog [action] [subaction] - Manage blog posts";

export function help(): Array<string> {
  return [
    "/blog [action] [subaction] - Manage blog posts",
    "",
    "Available actions:",
    "  provider select - Select an active blog provider",
    "    - Opens a selection interface to choose from available providers",
    "  provider set <name> - Set a specific blog provider by name",
    "    - Directly sets the active provider without interactive selection",
    "",
    "  post select - Select an existing article or clear selection",
    "    - Opens a tree selection interface to choose from available posts",
    "    - Includes option to clear current selection",
    "",
    "  post info - Display information about the currently selected post",
    "    - Shows title, status, dates, word count, tags, and URL",
    "    - Requires a post to be selected first",
    "",
    "  post new - Clear the current post selection",
    "    - Starts fresh with no post selected",
    "    - Use this to begin creating a new post",
    "",
    "  post publish - Publish the currently selected post",
    "    - Changes post status from draft to published",
    "    - Requires a post to be selected first",
  ];
}

async function selectProvider(
  blogService: BlogService,
  agent: Agent
): Promise<void> {
  const availableBlogs = blogService.getAvailableBlogs();
  
  if (availableBlogs.length === 0) {
    agent.infoLine("No blog providers are registered.");
    return;
  }

  if (availableBlogs.length === 1) {
    agent.mutateState(BlogState, state => {
      state.activeBlogName = availableBlogs[0];
    });
    agent.infoLine(`Only one provider configured, auto-selecting: ${availableBlogs[0]}`);
    return;
  }

  const activeBlogName = agent.getState(BlogState).activeBlogName;
  const formattedBlogs = availableBlogs.map(name => ({
    name: `${name}${name === activeBlogName ? " (current)" : ""}`,
    value: name,
  }));

  const treeData = {
    name: "Available Providers",
    children: formattedBlogs,
  };

  const selectedValue = await agent.askHuman({
    type: "askForSingleTreeSelection",
    message: "Select an active blog provider",
    tree: treeData
  });

  if (selectedValue) {
    agent.mutateState(BlogState, state => {
      state.activeBlogName = selectedValue;
    })
    agent.infoLine(`Active provider set to: ${selectedValue}`);
  } else {
    agent.infoLine("Provider selection cancelled.");
  }
}

async function setProvider(
  providerName: string,
  blogService: BlogService,
  agent: Agent
): Promise<void> {
  const availableBlogs = blogService.getAvailableBlogs();
  
  if (availableBlogs.includes(providerName)) {
    agent.mutateState(BlogState, state => {
      state.activeBlogName = providerName;
    });
    agent.infoLine(`Active provider set to: ${providerName}`);
  } else {
    agent.infoLine(`Provider "${providerName}" not found. Available providers: ${availableBlogs.join(", ")}`);
  }
}

async function selectPost(
  blogService: BlogService,
  agent: Agent
): Promise<void> {
  const activeBlogName = agent.getState(BlogState).activeBlogName;
  if (!activeBlogName) {
    agent.infoLine("No active provider selected. Use /blog provider select first.");
    return;
  }

  try {
    const posts = await blogService.getAllPosts(agent);

    if (!posts || posts.length === 0) {
      agent.infoLine(`No posts found on ${activeBlogName}.`);
      return;
    }

    const formattedPosts = posts.map((post) => {
      const date = new Date(post.updated_at).toLocaleDateString();
      const status = post.status === "published" ? "📝" : "🔒";
      return {
        name: `${status} ${post.title} (${date})`,
        value: post.id,
        data: post,
      };
    });

    formattedPosts.unshift({
      name: "❌ Clear selection",
      value: "none",
      data: null as unknown as BlogPost
    });

    const treeData = {
      name: `${activeBlogName} Posts`,
      children: formattedPosts,
    };

    const selectedValue = await agent.askHuman({
      type: "askForSingleTreeSelection",
      message: `Select a post from ${activeBlogName} - Choose a post to work with or select 'Clear selection' to start fresh`,
      tree: treeData
    });

    debugger;
    if (selectedValue) {
      if (selectedValue === "none") {
        await blogService.clearCurrentPost(agent);
        agent.infoLine("Post selection cleared.");
      } else {
        const selectedPost = formattedPosts.find(post => post.value === selectedValue);
        if (selectedPost?.data) {
          debugger;

          await blogService.selectPostById(selectedPost.data.id,agent);
          agent.infoLine(`Selected post: "${selectedPost.data.title}"`);
        }
      }
    } else {
      agent.infoLine("Post selection cancelled.");
    }
  } catch (error) {
    agent.errorLine("Error during post selection:", error as Error);
  }
}

async function postInfo(
  blogService: BlogService,
  agent: Agent
): Promise<void> {
  const activeBlogName = agent.getState(BlogState).activeBlogName;
  if (!activeBlogName) {
    agent.infoLine("No active provider selected. Use /blog provider select first.");
    return;
  }

  const currentPost = blogService.getCurrentPost(agent);
  if (!currentPost) {
    agent.infoLine("No post is currently selected.");
    agent.infoLine("Use /blog post select to choose a post.");
    return;
  }

  const createdDate = new Date(currentPost.created_at).toLocaleString();
  const updatedDate = new Date(currentPost.updated_at).toLocaleString();

  const wordCount = currentPost.content
    ? currentPost.content
      .replace(/<[^>]*>/g, " ")
      .split(/\s+/)
      .filter(Boolean).length
    : 0;

  const infoLines = [
    `Blog: ${activeBlogName}`,
    `Title: ${currentPost.title}`,
    `Status: ${currentPost.status}`,
    `Created: ${createdDate}`,
    `Updated: ${updatedDate}`,
    `Word count (approx.): ${wordCount}`,
  ];

  if (currentPost.tags && currentPost.tags.length > 0) {
    infoLines.push(`Tags: ${currentPost.tags.join(", ")}`);
  }

  if (currentPost.url) {
    infoLines.push(`URL: ${currentPost.url}`);
  }

  agent.infoLine(infoLines.join("\n"));
}

export async function execute(remainder: string, agent: Agent): Promise<void> {
  const blogService = agent.requireServiceByType(BlogService);

  const [action, subaction, ...args] = remainder.split(/\s+/);

  if (action === "provider") {
    if (subaction === "select") {
      await selectProvider(blogService, agent);
    } else if (subaction === "set" && args[0]) {
      await setProvider(args[0], blogService, agent);
    } else {
      agent.infoLine("Usage: /blog provider select OR /blog provider set <name>");
    }
  } else if (action === "post") {
    switch (subaction) {
      case "select":
        await selectPost(blogService, agent);
        break;
      case "info":
        await postInfo(blogService, agent);
        break;
      case "new":
        const activeBlogName = agent.getState(BlogState).activeBlogName;
        if (!activeBlogName) {
          agent.infoLine("No active provider selected. Use /blog provider select first.");
          return;
        }
        await blogService.clearCurrentPost(agent);
        agent.infoLine("New post started. No post is currently selected. Use tools to create and publish.");
        break;
      case "publish":
        await blogService.publishPost(agent);
        break;
      default:
        agent.infoLine("Unknown subaction. Available subactions: select, info, new, publish");
    }
  } else {
    agent.infoLine("Unknown action. Available actions: provider [select|set], post [select|info|new|publish]");
  }
}