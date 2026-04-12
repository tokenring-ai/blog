# @tokenring-ai/blog

A blog abstraction for Token Ring providing unified API for managing blog
posts across multiple platforms.

## Overview

The `@tokenring-ai/blog` package provides a comprehensive abstraction for
managing blog posts across different blogging platforms. It integrates with
the Token Ring agent system to enable AI-powered content creation, management,
and publishing.

**Note:** This is an abstract interface package. Concrete blog platform
implementations (e.g., WordPress, Ghost) are provided by separate packages
that implement the `BlogProvider` interface.

### Key Features

- Multi-provider blog support with unified interface
- AI-powered image generation for blog posts with CDN integration
- Interactive chat commands for comprehensive blog management
- State management for active provider, post tracking, and review escalation
- Scripting API for programmatic post operations
- JSON-RPC endpoints for remote procedure calls
- CDN integration for automatic image uploads
- Markdown to HTML content processing with `marked`
- Zod schema validation for type safety
- Review pattern escalation for publishing workflows
- Interactive post selection with tree-based UI

## Installation

```bash
bun add @tokenring-ai/blog
```

### Dependencies

- `@tokenring-ai/ai-client` (0.2.0) - AI client for image generation
- `@tokenring-ai/app` (0.2.0) - Base application framework
- `@tokenring-ai/agent` (0.2.0) - Agent orchestration
- `@tokenring-ai/chat` (0.2.0) - Chat service integration
- `@tokenring-ai/utility` (0.2.0) - Shared utilities
- `@tokenring-ai/rpc` (0.2.0) - JSON-RPC implementation
- `@tokenring-ai/cdn` (0.2.0) - CDN service for image uploads
- `@tokenring-ai/scripting` (0.2.0) - Scripting API
- `@tokenring-ai/escalation` (0.2.0) - Escalation service
- `@tokenring-ai/image-generation` (0.2.0) - Image generation service
- `zod` (^4.3.6) - Schema validation
- `marked` (^17.0.5) - Markdown to HTML conversion
- `uuid` (^13.0.0) - Unique ID generation

---

## User Guide

### Chat Commands

#### Provider Management

| Command | Description |
| :--- | :--- |
| `/blog provider get` | Show current provider |
| `/blog provider list` | List all registered providers |
| `/blog provider set <name>` | Set the active provider by name |
| `/blog provider select` | Interactively select the provider |
| `/blog provider reset` | Reset to the initial configured provider |

#### Post Management

| Command | Description |
| :--- | :--- |
| `/blog post get` | Show current post title |
| `/blog post select` | Interactively select a post |
| `/blog post info` | Display detailed post information |
| `/blog post clear` | Clear the current post selection |
| `/blog post publish` | Publish the selected post |

#### Testing

| Command | Description |
| :--- | :--- |
| `/blog test` | Test blog connection |

### Tools

The package registers the following tools with the ChatService:

| Tool | Description |
| :--- | :--- |
| `blog_createPost` | Create a new blog post |
| `blog_updatePost` | Update the selected blog post |
| `blog_getRecentPosts` | Retrieve recent posts |
| `blog_getCurrentPost` | Get the selected post |
| `blog_selectPost` | Select a post by ID |
| `blog_generateImageForPost` | Generate AI image for post |

#### `blog_createPost`

Create a new blog post.

**Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | string | Yes | Title of the blog post |
| `contentInMarkdown` | string | Yes | Content in Markdown format |
| `tags` | string[] | No | Tags for the post |

**Returns:** `{ type: 'json', data: BlogPost }`

**Note:** The tool automatically strips markdown headers and converts
content to HTML using `marked`.

#### `blog_updatePost`

Update the currently selected blog post.

**Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | string | No | New title for the post |
| `contentInMarkdown` | string | No | Content in Markdown format |
| `tags` | string[] | No | New tags for the post |

**Returns:** `{ type: 'json', data: BlogPost }`

#### `blog_getRecentPosts`

Retrieves recent posts, optionally filtered by status and keyword.

**Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | string | No | Filter by status |
| `keyword` | string | No | Keyword to filter by |
| `limit` | number | No | Maximum posts (default: 50) |

**Returns:** Formatted table of recent posts as a string

#### `blog_getCurrentPost`

Get the currently selected post from a blog service.

**Parameters:** None

**Returns:** JSON object with success status and post data

**Note:** Returns error if no post is currently selected.

#### `blog_selectPost`

Selects a blog post by its ID.

**Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | Yes | The unique identifier of the post |

**Returns:** Formatted string with post details and JSON representation

#### `blog_generateImageForPost`

Generate an AI image for the currently selected blog post.

**Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `prompt` | string | Yes | Description of the image |
| `aspectRatio` | string | No | Aspect ratio (default: "square") |

**Returns:** JSON object with success status and image URL

**Aspect Ratio Options:**

- `square`: 1024x1024
- `tall`: 1024x1536
- `wide`: 1536x1024

**Note:** This tool gets the active blog provider's image generation model,
generates an image using the AI client, uploads the image to the provider's
configured CDN, and updates the current post with the featured image.

### Configuration

The plugin is configured using the `BlogConfigSchema`:

```yaml
blog:
  agentDefaults:
    provider: wordpress
    imageModel: dall-e-3
    reviewPatterns:
      - "(?:confidential|proprietary)"
    reviewEscalationTarget: manager@example.com
  defaultImageModels:
    - dall-e-3
    - stable-diffusion
```

#### Configuration Options

**BlogConfigSchema:**

| Option | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `agentDefaults` | object | No | Default config for blog agents |
| `defaultImageModels` | string[] | No | Default image model names |

**BlogAgentConfigSchema:**

| Option | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `provider` | string | No | Default blog provider name |
| `imageModel` | string | No | Default image generation model |
| `reviewPatterns` | string[] | No | Regex patterns for review |
| `reviewEscalationTarget` | string | No | Escalation target email |

### Scripting API

The package registers the following functions with the ScriptingService:

#### `createPost(title, html)`

Create a new blog post.

**Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | string | Yes | Post title |
| `html` | string | Yes | Post content in HTML |

**Returns:** Post ID as string

**Example:**

```typescript
const postId = await scripting.createPost(
  "My Post",
  "<h1>My Post</h1><p>Content here</p>"
);
```

#### `updatePost(title, html)`

Update the currently selected blog post.

**Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | string | Yes | New title |
| `html` | string | Yes | New content in HTML |

**Returns:** Post ID as string

**Example:**

```typescript
const postId = await scripting.updatePost(
  "Updated Title",
  "<h1>Updated</h1><p>New content</p>"
);
```

#### `getCurrentPost()`

Get the currently selected post.

**Returns:** Post object as JSON string or "No post selected"

**Example:**

```typescript
const post = await scripting.getCurrentPost();
```

#### `getAllPosts()`

Get all posts (summary list).

**Returns:** Array of posts as JSON string

**Example:**

```typescript
const posts = await scripting.getAllPosts();
```

### Integration

#### Plugin Registration

```typescript
import blogPlugin from '@tokenring-ai/blog/plugin';

app.installPlugin(blogPlugin, {
  blog: {
    agentDefaults: {
      provider: 'wordpress',
      imageModel: 'dall-e-3',
      reviewPatterns: ['(?:confidential|proprietary)'],
      reviewEscalationTarget: 'review@example.com'
    },
    defaultImageModels: ['dall-e-3', 'stable-diffusion']
  }
});
```

#### Provider Registration

Providers must be registered programmatically with the `BlogService`:

```typescript
import BlogService from '@tokenring-ai/blog/BlogService';
import type {
  BlogProvider,
  CreatePostData,
  UpdatePostData,
  BlogPostFilterOptions
} from '@tokenring-ai/blog/BlogProvider';

const myProvider: BlogProvider = {
  description: 'My Custom Provider',
  cdnName: 'my-cdn',

  async getAllPosts(): Promise<BlogPostListItem[]> {
    return [];
  },

  async getRecentPosts(
    filter: BlogPostFilterOptions
  ): Promise<BlogPostListItem[]> {
    return [];
  },

  async createPost(data: CreatePostData): Promise<BlogPost> {
    return {
      ...data,
      id: 'generated-id',
      created_at: Date.now(),
      updated_at: Date.now(),
      status: 'draft'
    };
  },

  async updatePost(
    id: string,
    updatedData: UpdatePostData
  ): Promise<BlogPost> {
    return {} as BlogPost;
  },

  async getPostById(id: string): Promise<BlogPost> {
    return {} as BlogPost;
  }
};

const blogService = agent.requireServiceByType(BlogService);
blogService.registerBlog('myProvider', myProvider);
```

**Note:** Providers are NOT configured through the plugin config. They must
be registered via `BlogService.registerBlog()` after the service is available.

### Best Practices

1. **Provider Registration**: Register blog providers programmatically via
   `BlogService.registerBlog()` - they are NOT configured through plugin config

2. **Review Patterns**: Use review patterns for sensitive content to ensure
   human approval before publishing

3. **Image Generation**: Use descriptive prompts for image generation to get
   relevant results

4. **Post Selection**: Always select a post before performing operations that
   require a current post

5. **Error Handling**: Check for null/undefined returns when getting current
   post or provider

6. **Content Format**:
   - Tools: Provide content in Markdown (automatically converted to HTML)
   - RPC: Provide content in Markdown (automatically converted to HTML)
   - Direct Service Calls: Provide content in HTML

7. **RPC vs Service**: RPC endpoints require explicit `provider` parameter;
   tools/commands use the agent's active provider state

8. **Review Escalation**: Only available through `/blog post publish` command
   or direct `BlogService.publishPost()` method - NOT available via RPC

---

## Developer Reference

### Core Components

#### BlogService

The main service that manages all blog operations and provider registration.

**Implements:** `TokenRingService`

**Key Properties:**

| Property | Type | Description |
| :--- | :--- | :--- |
| `name` | string | "BlogService" |
| `description` | string | "Abstract interface for blog operations" |
| `providers` | KeyedRegistry | Registry of registered blog providers |

**Key Methods:**

| Method | Description |
| :--- | :--- |
| `attach(agent, creationContext)` | Initialize the blog service |
| `requireActiveBlogProvider(agent)` | Require an active blog provider |
| `setActiveProvider(name, agent)` | Set the active blog provider |
| `getAllPosts(agent)` | Retrieve all posts from the active provider |
| `getRecentPosts(filter, agent)` | Retrieve recent posts with filtering |
| `createPost(data, agent)` | Create a new post |
| `updateCurrentPost(updatedData, agent)` | Update the selected post |
| `getCurrentPost(agent)` | Get the currently selected post |
| `selectPostById(id, agent)` | Select a post by ID |
| `clearCurrentPost(agent)` | Clear the current post selection |
| `publishPost(agent)` | Publish the selected post |

#### BlogProvider Interface

The interface for implementing blog platform integrations.

**Properties:**

| Property | Type | Description |
| :--- | :--- | :--- |
| `description` | string | Provider description |
| `cdnName` | string | CDN name for image uploads |

**Methods:**

| Method | Returns | Description |
| :--- | :--- | :--- |
| `getAllPosts()` | `Promise<BlogPostListItem[]>` | Get all posts |
| `getRecentPosts(filter)` | `Promise<BlogPostListItem[]>` | Get recent posts |
| `createPost(data)` | `Promise<BlogPost>` | Create a new post |
| `updatePost(id, updatedData)` | `Promise<BlogPost>` | Update a post by ID |
| `getPostById(id)` | `Promise<BlogPost>` | Get a post by its ID |

**Note:** The `BlogProvider` interface does NOT include `attach`,
`getCurrentPost`, `clearCurrentPost`, or `selectPostById` methods. These are
handled by the `BlogService`.

### State Management

The package uses `BlogState` for state management.

#### BlogState

**Properties:**

| Property | Type | Description |
| :--- | :--- | :--- |
| `activeProvider` | string or undefined | Currently selected provider |
| `reviewPatterns` | string[] or undefined | Regex patterns for review |
| `reviewEscalationTarget` | string or undefined | Escalation target email |
| `currentPost` | BlogPost or undefined | Currently selected post |

**Constructor:**

```typescript
constructor(initialConfig: z.output<typeof BlogAgentConfigSchema>)
```

**Methods:**

| Method | Returns | Description |
| :--- | :--- | :--- |
| `serialize()` | JSON object | Serialize state to JSON |
| `deserialize(data)` | void | Deserialize state from JSON |
| `transferStateFromParent(parent)` | void | Transfer state from parent |
| `show()` | string | Show state representation |

### RPC Endpoints

The package provides JSON-RPC endpoints at `/rpc/blog`.

#### Query Endpoints

| Endpoint | Request Params | Response Params |
| :--- | :--- | :--- |
| `getAllPosts` | `provider`, `status?`, `tag?`, `limit?` | `posts`, `count`, `currentlySelected`, `message` |
| `getPostById` | `provider`, `id` | `post`, `message` |
| `getBlogState` | `agentId` | `selectedPostId`, `selectedProvider`, `availableProviders` |

#### Mutation Endpoints

| Endpoint | Request Params | Response Params |
| :--- | :--- | :--- |
| `createPost` | `provider`, `title`, `contentInMarkdown`, `tags?` | `post`, `message` |
| `updatePost` | `provider`, `id`, `updatedData` | `post`, `message` |
| `updateBlogState` | `agentId`, `selectedPostId?`, `selectedProvider?` | `selectedPostId`, `selectedProvider`, `availableProviders` |

**Important Notes:**

- RPC endpoints require a `provider` parameter to specify which blog provider
  to use, unlike tools/commands which use the agent's active provider state.
- The RPC `createPost` endpoint automatically strips markdown headers and
  converts content to HTML using `marked`.
- The RPC `updatePost` endpoint accepts `updatedData` as a partial BlogPost
  object (excluding id, created_at, updated_at).
- The `getBlogState` and `updateBlogState` endpoints work with agent state.
- Review escalation is NOT available through RPC endpoints. Use the chat
  command `/blog post publish` or direct service method for review.

### Type Definitions

#### BlogPostListItem

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | string | Unique identifier |
| `title` | string | Post title |
| `status` | string | Post status |
| `tags` | string[] or undefined | Post tags |
| `created_at` | number | Creation date (Unix timestamp ms) |
| `updated_at` | number | Last update date (Unix timestamp ms) |
| `published_at` | number or undefined | Publication date |
| `feature_image` | object or undefined | Featured image |
| `url` | string or undefined | Post URL |

#### BlogPost

Extends `BlogPostListItem` with:

| Property | Type | Description |
| :--- | :--- | :--- |
| `html` | string | Post content in HTML format |

#### CreatePostData

```typescript
type CreatePostData = Omit<
  BlogPost,
  'id' | 'created_at' | 'updated_at' | 'published_at' | 'status'
>;
```

| Property | Type | Description |
| :--- | :--- | :--- |
| `title` | string | Post title |
| `html` | string | Post content in HTML |
| `tags` | string[] or undefined | Optional tags |
| `feature_image` | object or undefined | Optional featured image |

#### UpdatePostData

```typescript
type UpdatePostData = Partial<
  Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>
>;
```

All fields from `BlogPost` except `id`, `created_at`, `updated_at`
(all optional).

#### BlogPostFilterOptions

```typescript
type BlogPostFilterOptions = {
  keyword?: string;
  limit?: number;
  status?: 'draft' | 'published' | 'scheduled' | 'pending' | 'private';
};
```

### Testing and Development

#### Running Tests

```bash
bun test
```

#### Build

```bash
bun run build
```

#### Test Blog Connection

Use the `/blog test` command to test blog connectivity. This will:

1. List current posts
2. Create a test post
3. Upload a test image (hello.png)
4. Update the post with the image

**Note:** The test utility requires a `hello.png` file in the package directory.

#### Package Structure

```text
pkg/blog/
├── BlogProvider.ts       # Provider interface and types
├── BlogService.ts        # Main service implementation
├── commands.ts           # Command exports
├── index.ts              # Package exports
├── plugin.ts             # Plugin registration
├── schema.ts             # Configuration schemas
├── tools.ts              # Tool exports
├── vitest.config.ts      # Test configuration
├── commands/             # Agent commands
│   └── blog/
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
├── rpc/
│   ├── blog.ts           # RPC endpoint implementation
│   ├── schema.ts         # RPC schema definitions
│   └── test/             # RPC tests
├── state/
│   └── BlogState.ts      # State management
├── tools/                # Chat tools
│   ├── createPost.ts
│   ├── generateImageForPost.ts
│   ├── getCurrentPost.ts
│   ├── getRecentPosts.ts
│   ├── selectPost.ts
│   └── updatePost.ts
└── util/
    └── testBlogConnection.ts  # Connection testing utility
```

## License

MIT License - see LICENSE file for details.
