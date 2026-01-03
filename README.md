# @tokenring-ai/blog

## Overview

Provides an abstract blog service interface for managing blog posts across different platforms. This package offers a unified API for creating, updating, and managing blog posts with support for multiple blog providers, enabling seamless integration with the TokenRing AI ecosystem.

## Installation

```bash
bun install @tokenring-ai/blog
```

## Features

- **Unified API**: Standardized interface across multiple blog platforms
- **Multi-Provider Support**: Works with WordPress, Medium, Ghost, and custom blog providers
- **AI Image Generation**: Generate featured images using AI models
- **State Management**: Persistent post selection and provider state
- **Chat Command Integration**: Interactive commands for blog management
- **Scripting Support**: Global functions for programmatic access
- **CDN Integration**: Automatic image uploads to configured CDN service
- **Type-Safe Configuration**: Zod-based schema validation

## Core Components

### BlogProvider Interface

Standardized interface for blog provider implementations:

```typescript
export interface BlogPost {
  id: string;
  title: string;
  content?: string;
  status: 'draft' | 'published' | 'scheduled' | 'pending' | 'private';
  tags?: string[];
  created_at: Date;
  updated_at: Date;
  published_at?: Date;
  feature_image?: {
    id?: string;
    url?: string;
  }
  url?: string;
}

export type CreatePostData = Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'published_at' | 'status'>;

export type UpdatePostData = Partial<Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>>;

export interface BlogProvider {
  description: string;
  imageGenerationModel: string;
  cdnName: string;

  attach(agent: Agent): Promise<void>;

  getAllPosts(agent: Agent): Promise<BlogPost[]>;

  createPost(data: CreatePostData, agent: Agent): Promise<BlogPost>;

  updatePost(data: UpdatePostData, agent: Agent): Promise<BlogPost>;

  selectPostById(id: string, agent: Agent): Promise<BlogPost>;

  getCurrentPost(agent: Agent): BlogPost | null;

  clearCurrentPost(agent: Agent): Promise<void>;
}
```

### BlogService

Manages blog providers and post operations:

```typescript
export default class BlogService implements TokenRingService {
  name = "BlogService";
  description = "Abstract interface for blog operations";

  registerBlog(provider: BlogProvider): void;
  getAvailableBlogs(): string[];

  async attach(agent: Agent): Promise<void>;

  setActiveProvider(name: string, agent: Agent): void;

  async getAllPosts(agent: Agent): Promise<BlogPost[]>;

  async createPost(data: CreatePostData, agent: Agent): Promise<BlogPost>;

  async updatePost(data: UpdatePostData, agent: Agent): Promise<BlogPost>;

  getCurrentPost(agent: Agent): BlogPost | null;

  async selectPostById(id: string, agent: Agent): Promise<BlogPost>;

  async clearCurrentPost(agent: Agent): Promise<void>;

  async publishPost(agent: Agent): Promise<void>;
}
```

### BlogState

State management for blog operations:

```typescript
export class BlogState implements AgentStateSlice {
  name = "BlogState";
  activeProvider: string | null;

  constructor(readonly initialConfig: z.output<typeof BlogAgentConfigSchema>);

  transferStateFromParent(parent: Agent): void;

  reset(what: ResetWhat[]): void;

  serialize(): object;

  deserialize(data: any): void;

  show(): string[];
}
```

This class manages the active blog provider state, including initialization from config, serialization, deserialization, and transfer between agent states.

## Chat Commands

The plugin provides the following chat commands through the AgentCommandService:

### Provider Management

- `/blog provider get` - Display the currently active blog provider
- `/blog provider select` - Select an active blog provider interactively
- `/blog provider set <name>` - Set a specific blog provider by name
- `/blog provider reset` - Reset to the initial configured blog provider

### Post Management

- `/blog post get` - Display the currently selected post title
- `/blog post select` - Select an existing article or clear selection
- `/blog post info` - Display information about the currently selected post
- `/blog post clear` - Clears the current post selection
- `/blog post publish` - Publish the currently selected post

### Testing

- `/blog test` - Test blog connection by creating a post and uploading an image

## Tools

The plugin provides the following tools through the ChatService:

### blog_createPost

Create a new blog post with title, content, and tags.

```typescript
{
  name: "blog_createPost",
  description: "Create a new blog post",
  inputSchema: {
    title: z.string().describe("Title of the blog post"),
    contentInMarkdown: z.string().describe("The content of the post in Markdown format. The title of the post goes in the title tag, NOT inside the content"),
    tags: z.array(z.string()).describe("Tags for the post").optional()
  }
}
```

### blog_updatePost

Update the currently selected blog post.

```typescript
{
  name: "blog_updatePost",
  description: "Update the currently selected blog post",
  inputSchema: {
    title: z.string().describe("New title for the post").optional(),
    contentInMarkdown: z.string().describe("The content of the post in Markdown format. The title of the post goes in the title tag, NOT inside the content").optional(),
    tags: z.array(z.string()).describe("New tags for the post").optional()
  }
}
```

### blog_getAllPosts

Get all posts from a blog service with filtering options.

```typescript
{
  name: "blog_getAllPosts",
  description: "Get all posts from a blog service",
  inputSchema: {
    status: z.enum(['draft', 'published', 'all']).default('all').optional(),
    tag: z.string().describe("Filter by tag").optional(),
    limit: z.number().int().positive().default(10).optional()
  }
}
```

### blog_getCurrentPost

Get the currently selected post.

```typescript
{
  name: "blog_getCurrentPost",
  description: "Get the currently selected post from a blog service",
  inputSchema: {}
}
```

### blog_generateImageForPost

Generate an AI image and set it as the featured image for the currently selected post.

```typescript
{
  name: "blog_generateImageForPost",
  description: "Generate an AI image for the currently selected blog post",
  inputSchema: {
    prompt: z.string().describe("Description of the image to generate"),
    aspectRatio: z.enum(['square', 'tall', 'wide']).default('square').optional()
  }
}
```

## Plugin Configuration

The plugin is configured through the `blog` section in the Token Ring configuration:

```typescript
import {BlogConfigSchema} from "@tokenring-ai/blog";

const configSchema = z.object({
  blog: BlogConfigSchema.optional()
});
```

### BlogConfigSchema

```typescript
export const BlogAgentConfigSchema = z.object({
  provider: z.string().optional()
}).default({});

export const BlogConfigSchema = z.object({
  providers: z.record(z.string(), z.any()),
  agentDefaults: BlogAgentConfigSchema,
});
```

Example configuration:

```json
{
  "blog": {
    "providers": {
      "wordpress": {
        "url": "https://example.com/wp-json",
        "username": "admin",
        "password": "secret"
      }
    },
    "agentDefaults": {
      "provider": "wordpress"
    }
  }
}
```

## Usage Examples

### Basic Setup

```typescript
import { BlogService } from '@tokenring-ai/blog';

const blogService = new BlogService({
  providers: {
    wordpress: wordpressProvider,
    // other providers
  },
  agentDefaults: {
    provider: 'wordpress'
  }
});

await blogService.attach(agent);
```

### Creating a Post

```typescript
const blogService = agent.requireServiceByType(BlogService);
const newPost = await blogService.createPost({
  title: 'My New Post',
  content: 'This is the content in **Markdown** format.',
  tags: ['technology', 'ai']
}, agent);
```

### Updating a Post

```typescript
const updatedPost = await blogService.updatePost({
  title: 'Updated Title',
  content: 'This is the updated content in **Markdown** format.',
  tags: ['updated', 'technology']
}, agent);
```

### Selecting and Managing Posts

```typescript
// Get all posts
const allPosts = await blogService.getAllPosts(agent);

// Select a post by ID
await blogService.selectPostById('post-id', agent);

// Get currently selected post
const currentPost = blogService.getCurrentPost(agent);

// Clear current selection
await blogService.clearCurrentPost(agent);

// Publish a post
await blogService.publishPost(agent);
```

### Scripting Functions

The plugin registers the following global scripting functions:

```typescript
// Create a new post
await scriptingService.createPost("My Blog Post", "This is the content in **Markdown** format.");

// Update the post
await scriptingService.updatePost("My Blog Post", "Updated content with **bold text**.");

// Get all posts
const posts = await scriptingService.getAllPosts();

// Get current post
const currentPost = await scriptingService.getCurrentPost();
```

## Integration

### TokenRing Plugin Integration

```typescript
import {AgentCommandService} from "@tokenring-ai/agent";
import {TokenRingPlugin} from "@tokenring-ai/app";
import {ChatService} from "@tokenring-ai/chat";
import {ScriptingService} from "@tokenring-ai/scripting";
import BlogService from "./BlogService.ts";
import chatCommands from "./chatCommands.ts";
import {BlogConfigSchema} from "./index.ts";
import packageJSON from './package.json' with {type: 'json'};
import tools from "./tools.ts";
import {z} from "zod";

const packageConfigSchema = z.object({
  blog: BlogConfigSchema.optional()
});

export default {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(app, config) {
    if (! config.blog) return;
    const service = new BlogService(config.blog);
    app.services.register(service);

    app.services.waitForItemByType(ScriptingService, (scriptingService: ScriptingService) => {
      scriptingService.registerFunction(
        "createPost", {
          type: 'native',
          params: ['title', 'content'],
          async execute(this: ScriptingThis, title: string, content: string): Promise<string> {
            const post = await this.agent.requireServiceByType(BlogService).createPost({title, content}, this.agent);
            return `Created post: ${post.id}`;
          }
        });

      scriptingService.registerFunction("updatePost", {
          type: 'native',
          params: ['title', 'content'],
          async execute(this: ScriptingThis, title: string, content: string): Promise<string> {
            const post = await this.agent.requireServiceByType(BlogService).updatePost({title, content}, this.agent);
            return `Updated post: ${post.id}`;
          }
        }
      );

      scriptingService.registerFunction("getCurrentPost", {
          type: 'native',
          params: [],
          async execute(this: ScriptingThis): Promise<string> {
            const post = this.agent.requireServiceByType(BlogService).getCurrentPost(this.agent);
            return post ? JSON.stringify(post) : 'No post selected';
          }
        }
      );

      scriptingService.registerFunction("getAllPosts", {
          type: 'native',
          params: [],
          async execute(this: ScriptingThis): Promise<string> {
            const posts = await this.agent.requireServiceByType(BlogService).getAllPosts(this.agent);
            return JSON.stringify(posts);
          }
        }
      );
    });

    app.waitForService(ChatService, chatService =>
      chatService.addTools(packageJSON.name, tools)
    );
    app.waitForService(AgentCommandService, agentCommandService =>
      agentCommandService.addAgentCommands(chatCommands)
    );
  },
  config: packageConfigSchema
} satisfies TokenRingPlugin<typeof packageConfigSchema>;
```

### Provider Integration

Create a concrete implementation of `BlogProvider` for your specific blog platform:

```typescript
import { BlogProvider, type BlogPost, type CreatePostData, type UpdatePostData } from '@tokenring-ai/blog';
import { Agent } from '@tokenring-ai/agent';

class WordPressProvider implements BlogProvider {
  description = 'WordPress blog integration';
  imageGenerationModel = 'dall-e-3';
  cdnName = 'my-cdn';

  async attach(agent: Agent): Promise<void> {
    // Initialize WordPress client
  }

  async getAllPosts(agent: Agent): Promise<BlogPost[]> {
    // Fetch posts from WordPress
  }

  async createPost(data: CreatePostData, agent: Agent): Promise<BlogPost> {
    // Create a post on WordPress
  }

  async updatePost(data: UpdatePostData, agent: Agent): Promise<BlogPost> {
    // Update a post on WordPress
  }

  async selectPostById(id: string, agent: Agent): Promise<BlogPost> {
    // Select a post by ID
  }

  getCurrentPost(agent: Agent): BlogPost | null {
    // Get currently selected post
  }

  async clearCurrentPost(agent: Agent): Promise<void> {
    // Clear current post selection
  }
}
```

## Testing

```bash
# Run tests
vitest run

# Run tests with coverage
vitest run --coverage

# Run tests in watch mode
vitest
```

## Package Structure

```
pkg/blog/
├── BlogProvider.ts          # Interface definitions
├── BlogService.ts           # Main service implementation
├── state/BlogState.ts       # State management
├── tools/                   # Tool implementations
│   ├── createPost.ts
│   ├── updatePost.ts
│   ├── getAllPosts.ts
│   ├── getCurrentPost.ts
│   └── generateImageForPost.ts
├── commands/
│   ├── chatCommands.ts      # Command registration
│   └── blog.ts              # Main command router
│       ├── post/
│       │   ├── clear.ts
│       │   ├── get.ts
│       │   ├── info.ts
│       │   ├── publish.ts
│       │   └── select.ts
│       ├── provider/
│       │   ├── get.ts
│       │   ├── reset.ts
│       │   ├── select.ts
│       │   └── set.ts
│       └── test.ts
├── util/
│   └── testBlogConnection.ts
├── plugin.ts                # Plugin installation
├── schema.ts
├── index.ts                 # Exports
├── hello.png                # Test image for blog connection tests
├── package.json
├── LICENSE
└── vitest.config.ts
```

## License

MIT License - see [LICENSE](./LICENSE) file for details.
