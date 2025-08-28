import {HumanInterfaceService} from "@token-ring/chat";
import ChatService from "@token-ring/chat/ChatService";
import {Registry} from "@token-ring/registry";
import BlogService from "../BlogService.ts";
import type {BlogPost} from "../BlogResource.ts";

export const description = "/blog [action] [subaction] - Manage blog posts";

export function help(): Array<string> {
  return [
    "/blog [action] [subaction] - Manage blog posts",
    "",
    "Available actions:",
    "  blog select - Select an active blog service",
    "    - Opens a selection interface to choose from available blogs",
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
  ];
}

async function selectBlog(
  blogService: BlogService,
  chatService: ChatService,
  humanInterfaceService: HumanInterfaceService
): Promise<void> {
  const availableBlogs = blogService.getAvailableBlogs();
  
  if (availableBlogs.length === 0) {
    chatService.systemLine("No blog services are registered.");
    return;
  }

  if (availableBlogs.length === 1) {
    blogService.setActiveBlog(availableBlogs[0]);
    chatService.systemLine(`Active blog set to: ${availableBlogs[0]}`);
    return;
  }

  const currentActive = blogService.getActiveBlog();
  const formattedBlogs = availableBlogs.map(name => ({
    name: `${name}${name === currentActive ? " (current)" : ""}`,
    value: name,
  }));

  const treeData = {
    name: "Available Blogs",
    children: formattedBlogs,
  };

  const selectedValue = await humanInterfaceService.askForSingleTreeSelection({
    message: "Select an active blog service",
    tree: treeData
  });

  if (selectedValue) {
    blogService.setActiveBlog(selectedValue);
    chatService.systemLine(`Active blog set to: ${selectedValue}`);
  } else {
    chatService.systemLine("Blog selection cancelled.");
  }
}

async function selectPost(
  blogService: BlogService,
  chatService: ChatService,
  humanInterfaceService: HumanInterfaceService
): Promise<void> {
  const activeBlog = blogService.getActiveBlog();
  if (!activeBlog) {
    chatService.systemLine("No active blog selected. Use /blog blog select first.");
    return;
  }

  try {
    const posts = await blogService.getAllPosts();

    if (!posts || posts.length === 0) {
      chatService.systemLine(`No posts found on ${activeBlog}.`);
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
      name: `${activeBlog} Posts`,
      children: formattedPosts,
    };

    const selectedValue = await humanInterfaceService.askForSingleTreeSelection({
      message: `Select a post from ${activeBlog} - Choose a post to work with or select 'Clear selection' to start fresh`,
      tree: treeData
    });

    if (selectedValue) {
      if (selectedValue === "none") {
        blogService.clearCurrentPost();
        chatService.systemLine("Post selection cleared.");
      } else {
        const selectedPost = formattedPosts.find(post => post.value === selectedValue);
        if (selectedPost?.data) {
          blogService.selectPostById(selectedPost.data.id);
          chatService.systemLine(`Selected post: "${selectedPost.data.title}"`);
        }
      }
    } else {
      chatService.systemLine("Post selection cancelled.");
    }
  } catch (error) {
    chatService.errorLine("Error during post selection:", error);
  }
}

async function postInfo(
  blogService: BlogService,
  chatService: ChatService,
): Promise<void> {
  const activeBlog = blogService.getActiveBlog();
  if (!activeBlog) {
    chatService.systemLine("No active blog selected. Use /blog blog select first.");
    return;
  }

  const currentPost = blogService.getCurrentPost();
  if (!currentPost) {
    chatService.systemLine("No post is currently selected.");
    chatService.systemLine("Use /blog post select to choose a post.");
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
    `Blog: ${activeBlog}`,
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

  chatService.systemLine(infoLines.join("\n"));
}

export async function execute(remainder: string, registry: Registry): Promise<void> {
  const chatService = registry.requireFirstServiceByType(ChatService);
  const humanInterfaceService = registry.requireFirstServiceByType(HumanInterfaceService);
  const blogService = registry.requireFirstServiceByType(BlogService);

  const [action, subaction] = remainder.split(/\s+/);

  if (action === "blog") {
    switch (subaction) {
      case "select":
        await selectBlog(blogService, chatService, humanInterfaceService);
        break;
      default:
        chatService.systemLine("Unknown subaction. Available subactions: select");
    }
  } else if (action === "post") {
    switch (subaction) {
      case "select":
        await selectPost(blogService, chatService, humanInterfaceService);
        break;
      case "info":
        await postInfo(blogService, chatService);
        break;
      case "new":
        const activeBlog = blogService.getActiveBlog();
        if (!activeBlog) {
          chatService.systemLine("No active blog selected. Use /blog blog select first.");
          return;
        }
        blogService.clearCurrentPost();
        chatService.systemLine("New post started. No post is currently selected. Use tools to create and publish.");
        break;
      default:
        chatService.systemLine("Unknown subaction. Available subactions: select, info, new");
    }
  } else {
    chatService.systemLine("Unknown action. Available actions: blog [select], post [select|info|new]");
  }
}