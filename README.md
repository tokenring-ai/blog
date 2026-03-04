# @tokenring-ai/blog

A blog abstraction for Token Ring providing unified API for managing blog posts across multiple platforms.

## Overview

The `@tokenring-ai/blog` package provides a comprehensive interface for managing blog posts across different blogging platforms. It integrates with the Token Ring agent system to enable AI-powered content creation, management, and publishing.

### Key Features

- Multi-provider blog support with unified interface
- AI-powered image generation for blog posts with CDN integration
- Interactive chat commands for comprehensive blog management
- State management for active provider and post tracking
- Scripting API for programmatic post operations
- JSON-RPC endpoints for remote procedure calls
- CDN integration for automatic image uploads
- Markdown and HTML content processing with `marked`
- Zod schema validation for type safety
- Robust error handling with clear messages
- Review pattern escalation for publishing workflows
- Interactive post selection with tree-based UI

## Installation

```bash
bun add @tokenring-ai/blog
```

### Dependencies

- `@tokenring-ai/ai-client` - AI client for image generation
- `@tokenring-ai/app` - Base application framework
- `@tokenring-ai/agent` - Agent orchestration
- `@tokenring-ai/chat` - Chat service integration
- `@tokenring-ai/utility` - Shared utilities
- `@tokenring-ai/rpc` - JSON-RPC implementation
- `@tokenring-ai/cdn` - CDN service for image uploads
- `@tokenring-ai/scripting` - Scripting API
- `@tokenring-ai/escalation` - Escalation service for review workflows
- `zod` - Schema validation
- `marked` - Markdown to HTML conversion
- `uuid` - Unique ID generation

## Chat Commands

### Provider Management

- `/blog provider get` - Show current provider
- `/blog provider set <name>` - Set the active blog provider by name
- `/blog provider select` - Interactively select the active blog provider
- `/blog provider reset` - Reset the active blog provider to the initial configured value

### Post Management

- `/blog post get` - Show current post title
- `/blog post select` - Interactively select a post to work with
- `/blog post info` - Display detailed information about the currently selected post
- `/blog post clear` - Clear the current post selection
- `/blog post publish` - Publish the currently selected post

### Testing

- `/blog test` - Test blog connection by listing posts, creating a test post, uploading an image, and updating the post

## Plugin Configuration

The plugin is configured using the `BlogConfigSchema`:

```typescript
export const BlogConfigSchema = z.object({
  providers: z.record(z.string(), z.any()).default({}),
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

### Configuration Options

#### BlogConfigSchema

- **providers**: Record of provider names to their configuration objects
- **agentDefaults**: Default configuration for blog agents

#### BlogAgentConfigSchema

- **provider**: Optional default blog provider name
- **reviewPatterns**: Array of regex patterns that trigger review escalation before publishing
- **reviewEscalationTarget**: Email or identifier for review escalation target

## Tools

The package registers the following tools with the ChatService:

### `blog_createPost`

Create a new blog post.

**Parameters:**
- `title` (string): Title of the blog post
- `contentInMarkdown` (string): The content of the post in Markdown format. The title of the post goes in the title tag, NOT inside the content
- `tags` (string[], optional): Tags for the post

**Returns:** Created blog post object

**Note:** The tool automatically strips the header from the markdown content and converts it to HTML using `marked`.

### `blog_updatePost`

Update the currently selected blog post.

**Parameters:**
- `title` (string, optional): New title for the post
- `contentInMarkdown` (string, optional): The content of the post in Markdown format
- `tags` (string[], optional): New tags for the post

**Returns:** Updated blog post object

**Note:** The tool automatically strips the header from the markdown content and converts it to HTML using `marked`.

### `blog_getRecentPosts`

Retrieves the most recent published posts, optionally filtered by status and keyword.

**Parameters:**
- `status` ("draft" | "published" | "all", optional): Filter by status
- `keyword` (string, optional): Keyword to filter by
- `limit` (number, optional): Maximum number of posts to return (default: 50)

**Returns:** Formatted table of recent posts

### `blog_getCurrentPost`

Get the currently selected post from a blog service.

**Parameters:** None

**Returns:** Current post object or error if no post is selected

### `blog_selectPost`

Selects a blog post by its ID to perform further actions on it.

**Parameters:**
- `id` (string): The unique identifier of the post to select

**Returns:** Confirmation message with post details

### `blog_generateImageForPost`

Generate an AI image for the currently selected blog post.

**Parameters:**
- `prompt` (string): Description of the image to generate
- `aspectRatio` ("square" | "tall" | "wide", optional): Aspect ratio for the image (default: "square")

**Returns:** Success status and image URL

**Note:** This tool:
1. Gets the active blog provider's image generation model
2. Generates an image using the AI client
3. Uploads the image to the provider's configured CDN
4. Updates the current post with the featured image

**Aspect Ratio Options:**
- `square`: 1024x1024
- `tall`: 1024x1536
- `wide`: 1536x1024

## Services

### BlogService

The main service that manages all blog operations and provider registration.

**Implements:** `TokenRingService`

**Key Properties:**
- `name`: "BlogService"
- `description`: "Abstract interface for blog operations"
- `providers`: KeyedRegistry of registered blog providers

**Key Methods:**

#### `attach(agent: Agent, creationContext: AgentCreationContext): void`

Initialize the blog service with the agent. Registers state, attaches all providers, and logs the selected provider.

#### `requireActiveBlogProvider(agent: Agent): BlogProvider`

Require an active blog provider. Throws an error if no provider is selected.

#### `setActiveProvider(name: string, agent: Agent): void`

Set the active blog provider by name.

#### `getAllPosts(agent: Agent): Promise<BlogPost[]>`

Retrieve all posts from the active provider.

#### `getRecentPosts(filter: BlogPostFilterOptions, agent: Agent): Promise<BlogPost[]>`

Retrieve recent posts with filtering options.

**Filter Options:**
- `keyword`: Filter by keyword
- `limit`: Maximum number of posts
- `status`: Filter by status (draft, published, scheduled, pending, private)

#### `createPost(data: CreatePostData, agent: Agent): Promise<BlogPost>`

Create a new post.

**CreatePostData:**
- `title`: Post title
- `content`: Post content in HTML
- `tags`: Optional tags
- `feature_image`: Optional featured image

#### `updatePost(data: UpdatePostData, agent: Agent): Promise<BlogPost>`

Update an existing post.

**UpdatePostData:**
- All fields from BlogPost except id, created_at, updated_at

#### `getCurrentPost(agent: Agent): BlogPost | null`

Get the currently selected post.

#### `selectPostById(id: string, agent: Agent): Promise<BlogPost>`

Select a post by ID.

#### `clearCurrentPost(agent: Agent): Promise<void>`

Clear the current post selection.

#### `publishPost(agent: Agent): Promise<void>`

Publish the currently selected post with review escalation support.

**Review Escalation Flow:**
1. Checks if post content matches any configured review patterns
2. If a pattern matches and an escalation target is configured:
   - Sends escalation message to the target
   - Waits for user response (approve/reject)
   - Publishes if approved, rejects if rejected
3. If no patterns match or no escalation target:
   - Directly publishes the post

## RPC Endpoints

The package provides JSON-RPC endpoints at `/rpc/blog`.

### Query Endpoints

| Endpoint | Request Params | Response Params |
|----------|----------------|-----------------|
| `getCurrentPost` | `agentId: string` | `post: BlogPost \| null`, `message: string` |
| `getAllPosts` | `agentId: string`, `status?`, `tag?`, `limit?` | `posts: BlogPost[]`, `count: number`, `currentlySelected: string \| null`, `message: string` |
| `getActiveProvider` | `agentId: string` | `provider: string \| null`, `availableProviders: string[]` |

### Mutation Endpoints

| Endpoint | Request Params | Response Params |
|----------|----------------|-----------------|
| `createPost` | `agentId: string`, `title: string`, `contentInMarkdown: string`, `tags?` | `post: BlogPost`, `message: string` |
| `updatePost` | `agentId: string`, `title?`, `contentInMarkdown?`, `tags?`, `status?`, `feature_image?` | `post: BlogPost`, `message: string` |
| `selectPostById` | `agentId: string`, `id: string` | `post: BlogPost`, `message: string` |
| `clearCurrentPost` | `agentId: string` | `success: boolean`, `message: string` |
| `publishPost` | `agentId: string` | `success: boolean`, `message: string` |
| `setActiveProvider` | `agentId: string`, `name: string` | `success: boolean`, `message: string` |
| `generateImageForPost` | `agentId: string`, `prompt: string`, `aspectRatio?` | `success: boolean`, `imageUrl?`, `message: string` |

**Note:** The RPC `publishPost` endpoint does not include review escalation logic. Review escalation is only available through the `BlogService.publishPost()` method when called directly.

## Scripting API

The package registers the following functions with the ScriptingService:

### `createPost(title, content)`

Create a new blog post.

**Parameters:**
- `title` (string): Post title
- `content` (string): Post content in Markdown

**Returns:** Post ID

**Example:**
```typescript
const postId = await scripting.createPost("My Post", "# My Post\nContent here");
```

### `updatePost(title, content)`

Update the currently selected blog post.

**Parameters:**
- `title` (string): New title
- `content` (string): New content in Markdown

**Returns:** Post ID

**Example:**
```typescript
const postId = await scripting.updatePost("Updated Title", "# Updated\nNew content");
```

### `getCurrentPost()`

Get the currently selected post.

**Returns:** Post object as JSON string or "No post selected"

**Example:**
```typescript
const post = await scripting.getCurrentPost();
```

### `getAllPosts()`

Get all posts.

**Returns:** Array of posts as JSON string

**Example:**
```typescript
const posts = await scripting.getAllPosts();
```

## Providers

The package provides the `BlogProvider` interface for implementing blog platform integrations.

### BlogProvider Interface

**Properties:**
- `description: string` - Provider description
- `imageGenerationModel: string` - Model name for image generation
- `cdnName: string` - CDN name for image uploads

**Methods:**
- `attach(agent: Agent, creationContext: AgentCreationContext): void` - Initialize provider with agent
- `getAllPosts(agent: Agent): Promise<BlogPost[]>` - Get all posts
- `getRecentPosts(filter: BlogPostFilterOptions, agent: Agent): Promise<BlogPost[]>` - Get recent posts
- `createPost(data: CreatePostData, agent: Agent): Promise<BlogPost>` - Create a new post
- `updatePost(data: UpdatePostData, agent: Agent): Promise<BlogPost>` - Update a post
- `selectPostById(id: string, agent: Agent): Promise<BlogPost>` - Select a post by ID
- `getCurrentPost(agent: Agent): BlogPost | null` - Get the current post
- `clearCurrentPost(agent: Agent): Promise<void>` - Clear the current post

### BlogPost Interface

**Properties:**
- `id: string` - Unique identifier
- `title: string` - Post title
- `content?: string` - Post content in HTML
- `status: 'draft' | 'published' | 'scheduled' | 'pending' | 'private'` - Post status
- `tags?: string[]` - Post tags
- `created_at: Date` - Creation date
- `updated_at: Date` - Last update date
- `published_at?: Date` - Publication date
- `feature_image?: { id?: string, url?: string }` - Featured image
- `url?: string` - Post URL

### CreatePostData

```typescript
type CreatePostData = Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'published_at' | 'status'>;
```

### UpdatePostData

```typescript
type UpdatePostData = Partial<Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>>;
```

### BlogPostFilterOptions

```typescript
type BlogPostFilterOptions = {
  keyword?: string;
  limit?: number;
  status?: 'draft' | 'published' | 'scheduled' | 'pending' | 'private';
}
```

## State Management

The package uses `BlogState` for state management.

### BlogState

**Properties:**
- `activeProvider: string | null` - Currently selected blog provider
- `reviewPatterns?: string[]` - Array of regex patterns for review escalation
- `reviewEscalationTarget?: string` - Email or identifier for review escalation

**Methods:**
- `serialize(): z.output<typeof serializationSchema>` - Serialize state to JSON
- `deserialize(data: z.output<typeof serializationSchema>): void` - Deserialize state from JSON
- `transferStateFromParent(parent: Agent): void` - Transfer state from parent agent
- `show(): string[]` - Show state representation

### State Serialization Schema

```typescript
const serializationSchema = z.object({
  activeProvider: z.string().nullable(),
  reviewPatterns: z.array(z.string()).optional(),
  reviewEscalationTarget: z.string().optional(),
}).prefault({ activeProvider: null});
```

## Integration

### Plugin Registration

```typescript
import blogPlugin from '@tokenring-ai/blog/plugin';

app.installPlugin(blogPlugin, {
  blog: {
    providers: {
      // Your provider configurations
    },
    agentDefaults: {
      provider: 'wordpress',
      reviewPatterns: ['(?:confidential|proprietary)'],
      reviewEscalationTarget: 'review@example.com'
    }
  }
});
```

### Service Registration

The plugin automatically registers:
- `BlogService` - Main blog service
- Chat tools - All blog operations
- Agent commands - Interactive commands
- RPC endpoints - Remote procedure calls
- Scripting functions - Programmatic API

### Provider Registration

Register providers with the BlogService:

```typescript
import BlogService from '@tokenring-ai/blog/BlogService';

const blogService = agent.requireServiceByType(BlogService);
blogService.registerBlog('myProvider', {
  description: 'My Custom Provider',
  imageGenerationModel: 'dall-e-3',
  cdnName: 'my-cdn',
  // ... implement interface methods
});
```

## Testing and Development

### Running Tests

```bash
bun test
```

### Build

```bash
bun run build
```

### Test Blog Connection

Use the `/blog test` command to test blog connectivity. This will:
1. List current posts
2. Create a test post
3. Upload a test image (hello.png)
4. Update the post with the image

**Note:** The test utility requires a `hello.png` file in the package directory.

## Best Practices

1. **Provider Configuration**: Always configure at least one provider before using blog operations
2. **Review Patterns**: Use review patterns for sensitive content to ensure human approval before publishing
3. **Image Generation**: Use descriptive prompts for image generation to get relevant results
4. **Post Selection**: Always select a post before performing operations that require a current post
5. **Error Handling**: Check for null returns when getting current post or provider
6. **Content Format**: Provide content in Markdown for tools, which will be converted to HTML automatically
7. **RPC vs Service**: Note that RPC `publishPost` does not include review escalation - use the service method directly for review workflow support

## License

MIT License - see LICENSE file for details.
