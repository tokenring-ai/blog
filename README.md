# @token-ring/blog

This package provides an abstract blog service interface for managing blog posts across different platforms.

## Core Components

### BlogResource (Abstract Base Class)

The abstract `BlogResource` class defines a standardized interface for blog operations. Concrete implementations should extend this class.

**Key Methods:**
- `getAllPosts(): Promise<BlogPost[]>` - Get all posts
- `createPost(data: CreatePostData): Promise<BlogPost>` - Create a new post
- `updatePost(data: UpdatePostData): Promise<BlogPost>` - Update existing post
- `getCurrentPost(): BlogPost | null` - Get currently selected post
- `setCurrentPost(post: BlogPost | null): void` - Set current post

### BlogService

Manages multiple blog resources and provides a unified interface for blog operations.

### Tools

- **`createPost`** - Create a new blog post
## Usage

Concrete implementations (e.g., WordPress, Ghost.io, etc.) should extend `BlogResource` and implement the abstract methods.

## Global Scripting Functions

When `@tokenring-ai/scripting` is available, the blog package registers native functions:

- **createPost(title, content)**: Creates a new blog post.
  ```bash
  /var $result = createPost("My Title", "Post content here")
  /call createPost("Article", "Content")
  ```

- **updatePost(title, content)**: Updates the currently selected post.
  ```bash
  /var $result = updatePost("New Title", "Updated content")
  ```

- **getCurrentPost()**: Gets the currently selected post as JSON.
  ```bash
  /var $post = getCurrentPost()
  ```

- **getAllPosts()**: Gets all posts as JSON.
  ```bash
  /var $posts = getAllPosts()
  ```