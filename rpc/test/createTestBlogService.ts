import BlogService from "../../BlogService.js";
import {BlogConfigSchema} from "../../schema.ts";
import {Agent} from "@tokenring-ai/agent";
import {z} from "zod";

// Test configuration for BlogService
const testConfig = {
  providers: {
    test: {
      type: 'test',
      name: 'Test Blog',
      description: 'Test blog provider',
    }
  }
};

// Mock Test Blog Provider
class TestBlogProvider {
  name = 'test';
  description = 'Test Blog';
  posts: any[] = [];
  currentPostId: string | null = null;
  imageGenerationModel = 'test-model';
  cdnName = 'test-cdn';

  async attach(agent: Agent): Promise<void> {
    // Initialize test posts
    this.posts = [
      {
        id: 'post-1',
        title: 'Test Post 1',
        content: 'Test content 1',
        status: 'draft',
        tags: ['test'],
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        url: 'https://example.com/post-1',
      },
      {
        id: 'post-2',
        title: 'Test Post 2',
        content: 'Test content 2',
        status: 'published',
        tags: ['test', 'published'],
        created_at: new Date('2024-01-02'),
        updated_at: new Date('2024-01-02'),
        published_at: new Date('2024-01-02'),
        url: 'https://example.com/post-2',
      },
    ];
  }

  async getAllPosts(agent: Agent): Promise<any[]> {
    return this.posts;
  }

  async createPost(data: any, agent: Agent): Promise<any> {
    const newPost = {
      id: `post-${Date.now()}`,
      title: data.title,
      content: data.content,
      status: 'draft',
      tags: data.tags || [],
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.posts.push(newPost);
    this.currentPostId = newPost.id;
    return newPost;
  }

  async updatePost(data: any, agent: Agent): Promise<any> {
    const currentPost = this.getCurrentPost(agent);
    if (!currentPost) {
      throw new Error('No post currently selected');
    }
    const index = this.posts.findIndex(p => p.id === currentPost.id);
    if (index === -1) {
      throw new Error('Post not found');
    }
    this.posts[index] = {
      ...this.posts[index],
      ...data,
      updated_at: new Date(),
    };
    return this.posts[index];
  }

  getCurrentPost(agent: Agent): any | null {
    if (!this.currentPostId) return null;
    return this.posts.find(p => p.id === this.currentPostId) || null;
  }

  async selectPostById(id: string, agent: Agent): Promise<any> {
    const post = this.posts.find(p => p.id === id);
    if (!post) {
      throw new Error('Post not found');
    }
    this.currentPostId = id;
    return post;
  }

  async clearCurrentPost(agent: Agent): Promise<void> {
    this.currentPostId = null;
  }
}

// Create a test instance of BlogService
export default function createTestBlogService() {
  const blogService = new BlogService(BlogConfigSchema.parse(testConfig));
  
  // Register the test provider
  const testProvider = new TestBlogProvider();
  blogService.registerBlog(testProvider as any);
  
  return { blogService, testProvider };
}
