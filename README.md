# @tokenring-ai/blog

A blog abstraction for Token Ring providing unified API for managing blog posts across multiple platforms.

## Overview

The `@tokenring-ai/blog` package provides a comprehensive interface for managing blog posts across different blogging platforms. It integrates with the Token Ring agent system to enable AI-powered content creation, management, and publishing.

### Key Features

- Multi-provider blog support with unified interface
- AI-powered image generation for blog posts
- Interactive chat commands for comprehensive blog management
- State management for active provider and post tracking
- Scripting API for programmatic post operations
- JSON-RPC endpoints for remote procedure calls
- CDN integration for automatic image uploads
- Markdown and HTML content processing
- Zod schema validation for type safety
- Robust error handling with clear messages
- Review pattern escalation for publishing workflows

## Chat Commands

- `/blog provider [command]` - Manage blog providers (get, select, set, reset)
- `/blog post [command]` - Manage blog posts (get, select, info, clear, publish)
- `/blog test` - Test blog connection

## Plugin Configuration

The plugin is configured using the `BlogConfigSchema`:

```typescript
export const BlogConfigSchema = z.object({
  providers: z.record(z.string(), z.any()),
  agentDefaults: BlogAgentConfigSchema,
});

export const BlogAgentConfigSchema = z.object({
  provider: z.string().optional(),
  reviewPatterns: z.array(z.string()).optional(),
  reviewEscalationTarget: z.string().optional(),
}).default({});
```

### Example Configuration

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
      "provider": "wordpress",
      "reviewPatterns": ["(?:confidential|proprietary)"],
      "reviewEscalationTarget": "manager@example.com"
    }
  }
}
```

## Agent Configuration

The plugin uses `BlogAgentConfigSchema` for agent-level configuration, which includes:

- **provider**: Optional default blog provider name
- **reviewPatterns**: Array of regex patterns that trigger review escalation
- **reviewEscalationTarget**: Email or identifier for review escalation

## Tools

The package registers the following tools with the ChatService:

- `blog_createPost` - Create a new blog post
- `blog_updatePost` - Update the currently selected blog post
- `blog_getRecentPosts` - Retrieve recent posts with optional filtering
- `blog_getCurrentPost` - Get the currently selected blog post
- `blog_generateImageForPost` - Generate and set a featured image for the post
- `blog_selectPost` - Select a blog post by its ID

## Services

### BlogService

The main service that manages all blog operations and provider registration.

**Key Methods:**

- `attach(agent: Agent): void` - Initialize the blog service with the agent
- `requireActiveBlogProvider(agent: Agent): BlogProvider` - Require an active blog provider
- `setActiveProvider(name: string, agent: Agent): void` - Set the active blog provider
- `getAllPosts(agent: Agent): Promise<BlogPost[]>` - Retrieve all posts
- `getRecentPosts(filter: BlogPostFilterOptions, agent: Agent): Promise<BlogPost[]>` - Retrieve recent posts with filtering
- `createPost(data: CreatePostData, agent: Agent): Promise<BlogPost>` - Create a new post
- `updatePost(data: UpdatePostData, agent: Agent): Promise<BlogPost>` - Update an existing post
- `getCurrentPost(agent: Agent): BlogPost | null` - Get the currently selected post
- `selectPostById(id: string, agent: Agent): Promise<BlogPost>` - Select a post by ID
- `clearCurrentPost(agent: Agent): Promise<void>` - Clear the current post selection
- `publishPost(agent: Agent): Promise<void>` - Publish the currently selected post

## Providers

The package provides the `BlogProvider` interface for implementing blog platform integrations:

- `description: string` - Provider description
- `imageGenerationModel: string` - Model name for image generation
- `cdnName: string` - CDN name for image uploads
- `attach(agent: Agent): void` - Initialize provider with agent
- `getAllPosts(agent: Agent): Promise<BlogPost[]>` - Get all posts
- `getRecentPosts(filter: BlogPostFilterOptions, agent: Agent): Promise<BlogPost[]>` - Get recent posts
- `createPost(data: CreatePostData, agent: Agent): Promise<BlogPost>` - Create a new post
- `updatePost(data: UpdatePostData, agent: Agent): Promise<BlogPost>` - Update a post
- `selectPostById(id: string, agent: Agent): Promise<BlogPost>` - Select a post by ID
- `getCurrentPost(agent: Agent): BlogPost | null` - Get the current post
- `clearCurrentPost(agent: Agent): Promise<void>` - Clear the current post

## RPC Endpoints

The package provides JSON-RPC endpoints at `/rpc/blog`:

### Query Endpoints

| Endpoint | Request Params | Response Params |
|----------|----------------|-----------------|
| `getCurrentPost` | agentId: string | post: BlogPost \| null, message: string |
| `getAllPosts` | agentId, status?, tag?, limit? | posts: BlogPost[], count, currentlySelected, message |
| `getActiveProvider` | agentId: string | provider: string \| null, availableProviders: string[] |

### Mutation Endpoints

| Endpoint | Request Params | Response Params |
|----------|----------------|-----------------|
| `createPost` | agentId, title, contentInMarkdown, tags? | post: BlogPost, message |
| `updatePost` | agentId, title?, contentInMarkdown?, tags?, status?, feature_image? | post: BlogPost, message |
| `selectPostById` | agentId, id: string | post: BlogPost, message |
| `clearCurrentPost` | agentId | success: boolean, message |
| `publishPost` | agentId | success: boolean, message |
| `setActiveProvider` | agentId, name: string | success: boolean, message |
| `generateImageForPost` | agentId, prompt, aspectRatio? | success: boolean, imageUrl?, message |

## State Management

The package uses `BlogState` for state management:

- **activeProvider**: Currently selected blog provider
- **reviewPatterns**: Array of regex patterns for review escalation
- **reviewEscalationTarget**: Email or identifier for review escalation

### State Methods

- `serialize(): z.output<typeof serializationSchema>` - Serialize state to JSON
- `deserialize(data: z.output<typeof serializationSchema>): void` - Deserialize state from JSON
- `transferStateFromParent(parent: Agent): void` - Transfer state from parent agent
- `show(): string[]` - Show state representation

## License

MIT License - see LICENSE file for details.
