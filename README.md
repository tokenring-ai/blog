# @tokenring-ai/blog

Provides an abstract blog service interface for managing blog posts across different platforms. This package offers a unified API for creating, updating, and managing blog posts with support for multiple blog providers.

## Core Components

### BlogProvider Interface

The `BlogProvider` interface defines a standardized contract for blog operations across different platforms:

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

Manages multiple blog resources and provides a unified interface for blog operations:

- Registers and manages blog providers
- Tracks the active blog provider
- Provides methods for post operations
- Manages current post selection
- Supports publishing and image generation

```typescript
export default class BlogService implements TokenRingService {
  name = "BlogService";
  description = "Abstract interface for blog operations";

  // Register and manage blog providers
  registerBlog(provider: BlogProvider): void;
  getAvailableBlogs(): string[];

  // Post operations
  createPost(data: CreatePostData, agent: Agent): Promise<BlogPost>;
  updatePost(data: UpdatePostData, agent: Agent): Promise<BlogPost>;
  getAllPosts(agent: Agent): Promise<BlogPost[]>;
  
  // Post selection and management
  selectPostById(id: string, agent: Agent): Promise<BlogPost>;
  getCurrentPost(agent: Agent): BlogPost | null;
  clearCurrentPost(agent: Agent): Promise<void>;
  publishPost(agent: Agent): Promise<void>;
}
```

### State Management

The package uses `BlogState` to track the active blog provider and selected post:

```typescript
export class BlogState implements AgentStateSlice {
  name = "BlogState";
  activeBlogName: string | undefined;

  // Methods for serialization, deserialization, and reset
  serialize(): object;
  deserialize(data: any): void;
  reset(what: ResetWhat[]): void;
  show(): string[];
}
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
├── commands/blog.ts         # Chat commands
├── chatCommands.ts          # Command registration
└── plugin.ts                # Plugin installation
```

## Usage

### Basic Setup

```typescript
import { BlogService } from '@tokenring-ai/blog';

// Create and configure the blog service
const blogService = new BlogService();

// Register blog providers
blogService.registerBlog('wordpress', wordpressProvider);

// Attach to agent (initializes state and providers)
await blogService.attach(agent);
```

### Creating a Post

```typescript
import { BlogService } from '@tokenring-ai/blog';

const blogService = agent.requireServiceByType(BlogService);
const newPost = await blogService.createPost({
  title: 'My New Post',
  content: '<p>Post content here</p>',
  tags: ['technology', 'ai']
}, agent);
```

### Updating a Post

```typescript
const updatedPost = await blogService.updatePost({
  title: 'Updated Title',
  content: '<p>Updated content</p>',
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

## Tools

The package provides several built-in tools for blog operations:

### createPost
Create a new blog post with title, content, and tags.

```typescript
{
  "name": "blog_createPost",
  "description": "Create a new blog post",
  "inputSchema": {
    "title": "string",
    "contentInMarkdown": "string",
    "tags": "string[]"
  }
}
```

### updatePost
Update the currently selected blog post.

```typescript
{
  "name": "blog_updatePost",
  "description": "Update the currently selected blog post",
  "inputSchema": {
    "title": "string",
    "contentInMarkdown": "string",
    "tags": "string[]"
  }
}
```

### getAllPosts
Get all posts from a blog service with filtering options.

```typescript
{
  "name": "blog_getAllPosts",
  "description": "Get all posts from a blog service",
  "inputSchema": {
    "status": "draft|published|all",
    "tag": "string",
    "limit": "number"
  }
}
```

### getCurrentPost
Get the currently selected post.

```typescript
{
  "name": "blog_getCurrentPost",
  "description": "Get the currently selected post from a blog service",
  "inputSchema": {}
}
```

### generateImageForPost
Generate an AI image and set it as the featured image for the currently selected post.

```typescript
{
  "name": "blog_generateImageForPost",
  "description": "Generate an AI image for the currently selected blog post",
  "inputSchema": {
    "prompt": "string",
    "aspectRatio": "square|tall|wide"
  }
}
```

## Chat Commands

### Provider Management

- `/blog provider select` - Select an active blog provider interactively
- `/blog provider set <name>` - Set a specific blog provider by name

### Post Management

- `/blog post select` - Select an existing article or clear selection
- `/blog post info` - Display information about the currently selected post
- `/blog post new` - Clear the current post selection
- `/blog post publish` - Publish the currently selected post
- `/blog test` - Test blog connection by creating a post and uploading an image

### Example Workflow

```bash
/blog provider select          # Select a blog provider
/blog post select             # Choose a post to work with
/blog post info              # View post details
/blog post new               # Start creating a new post
/blog generateImageForPost "AI-generated image"  # Add featured image
/blog post publish           # Publish the post
```

## Configuration

### Package Dependencies

```json
{
  "dependencies": {
    "@tokenring-ai/ai-client": "0.2.0",
    "@tokenring-ai/app": "0.2.0", 
    "@tokenring-ai/cdn": "0.2.0",
    "zod": "catalog:",
    "@tokenring-ai/agent": "0.2.0",
    "@tokenring-ai/chat": "0.2.0",
    "@tokenring-ai/utility": "0.2.0",
    "@tokenring-ai/scripting": "0.2.0",
    "marked": "^17.0.1",
    "uuid": "^13.0.0"
  }
}
```

### Environment Requirements

- Node.js 16+ with TypeScript support
- Access to blog provider API credentials
- CDN service for image uploads
- AI client service for image generation

## Development

### Testing

```bash
# Run tests
vitest run

# Run tests with coverage
vitest run:coverage

# Run tests in watch mode
vitest run:watch
```

### Building

```bash
# Build the package
bun run build
```

## Integration Patterns

### Provider Integration

Create a concrete implementation of `BlogProvider` for your specific blog platform:

```typescript
import { BlogProvider } from '@tokenring-ai/blog';

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
  
  // Implement other methods...
}
```

### Scripting Integration

The package provides scripting functions for programmatic access:

```typescript
// Register blog scripting functions
scriptingService.registerFunction("createPost", {
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
});
```

### Plugin Installation

The package registers as a Token Ring plugin with automatic service registration:

```typescript
export default {
  name: "@tokenring-ai/blog",
  version: "0.2.0",
  description: "A blog abstraction for Token Ring",
  install(app: TokenRingApp) {
    const config = app.getConfigSlice('blog', BlogConfigSchema);
    if (config) {
      const service = new BlogService();
      app.services.register(service);
    }
    
    // Register chat tools
    app.waitForService(ChatService, chatService => 
      chatService.addTools(packageJSON.name, tools)
    );
    
    // Register agent commands
    app.waitForService(AgentCommandService, agentCommandService => 
      agentCommandService.addAgentCommands(chatCommands)
    );
  },
} satisfies TokenRingPlugin;
```

## Best Practices

1. **Provider Registration**: Register all blog providers before attaching the service
2. **Error Handling**: Always check for errors when performing blog operations
3. **Image Generation**: Use the built-in image generation tool for featured images
4. **State Management**: Clear current post selection when starting a new post
5. **Publishing**: Only publish posts with appropriate status updates
6. **Scripting**: Use the built-in scripting functions for programmatic access
7. **CDN Integration**: Ensure proper CDN configuration for image uploads

## Known Issues

- Requires an active blog provider to be selected before most operations
- Image generation requires both AI client and CDN services to be available
- Markdown content is converted to HTML before saving

This package provides a comprehensive abstraction layer for blog operations that can be extended to support various blogging platforms.