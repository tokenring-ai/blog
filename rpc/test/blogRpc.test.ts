import {beforeEach, describe, expect, it, vi} from 'vitest';
import {AgentManager} from "@tokenring-ai/agent";
import TokenRingApp from "@tokenring-ai/app";
import blogRPC from "../blog.js";
import createTestBlogService from "./createTestBlogService.js";
import {ImageGenerationModelRegistry} from "@tokenring-ai/ai-client/ModelRegistry";
import CDNService from "@tokenring-ai/cdn/CDNService";

/**
 * Test suite for Blog RPC endpoints
 * Tests all 11 RPC methods defined in the blog schema
 */
describe('Blog RPC Endpoints', () => {
  let app: any;
  let agentManager: any;
  let agent: any;
  let blogService: any;
  let testProvider: any;
  let mockImageModelRegistry: any;
  let mockCdnService: any;

  beforeEach(async () => {
    // Create mock app
    app = {
      requireService: vi.fn((serviceType) => {
        if (serviceType === AgentManager) return agentManager;
        if (serviceType.constructor.name === 'BlogService') return blogService;
        if (serviceType.constructor.name === 'ImageGenerationModelRegistry') return mockImageModelRegistry;
        if (serviceType.constructor.name === 'CDNService') return mockCdnService;
        throw new Error(`Service not found: ${serviceType.name}`);
      })
    };

    // Create mock agent manager with a test agent
    agent = {
      id: 'test-agent-id',
      getState: vi.fn(),
      mutateState: vi.fn(),
      requireServiceByType: vi.fn(),
      getAgentConfigSlice: vi.fn(() => ({}))
    };

    agentManager = {
      getAgent: vi.fn((agentId) => {
        if (agentId === 'test-agent-id') return agent;
        return null;
      })
    };

    // Create test blog service
    const blogSetup = createTestBlogService();
    blogService = blogSetup.blogService;
    testProvider = blogSetup.testProvider;

    // Attach test provider to agent
    await testProvider.attach(agent);
    agent.mutateState.mockImplementation((stateClass, mutator) => {
      // Simulate state mutation
      if (typeof mutator === 'function') {
        const mockState = { activeProvider: 'test' };
        mutator(mockState);
      }
    });

    // Mock state retrieval
    agent.getState.mockReturnValue({ activeProvider: 'test' });

    // Mock image model registry
    mockImageModelRegistry = {
      getClient: vi.fn(async (model) => ({
        generateImage: vi.fn(async (params, agent) => {
          return [{
            mediaType: 'image/png',
            uint8Array: new Uint8Array([0x89, 0x50, 0x4E, 0x47]) // PNG header
          }];
        })
      }))
    };

    // Mock CDN service
    mockCdnService = {
      upload: vi.fn(async (cdnName, buffer, options) => ({
        id: 'cdn-id-123',
        url: 'https://cdn.example.com/test-image.png'
      }))
    };
  });

  describe('getCurrentPost', () => {
    it('should return null when no post is selected', async () => {
      testProvider.currentPostId = null;
      
      const result = await blogRPC.methods.getCurrentPost(
        { agentId: 'test-agent-id' },
        app
      );

      expect(result.post).toBeNull();
      expect(result.message).toBe('No post is currently selected');
    });

    it('should return the currently selected post', async () => {
      await testProvider.selectPostById('post-1', agent);
      
      const result = await blogRPC.methods.getCurrentPost(
        { agentId: 'test-agent-id' },
        app
      );

      expect(result.post).toBeTruthy();
      expect(result.post.id).toBe('post-1');
      expect(result.post.title).toBe('Test Post 1');
      expect(result.message).toContain('Test Post 1');
    });

    it('should throw error when agent not found', async () => {
      await expect(
        blogRPC.methods.getCurrentPost({ agentId: 'invalid-agent' }, app)
      ).rejects.toThrow('Agent not found');
    });
  });

  describe('getAllPosts', () => {
    it('should return all posts without filters', async () => {
      const result = await blogRPC.methods.getAllPosts(
        { agentId: 'test-agent-id' },
        app
      );

      expect(result.posts).toHaveLength(2);
      expect(result.count).toBe(2);
      expect(result.currentlySelected).toBeNull();
      expect(result.message).toContain('Found 2 posts');
    });

    it('should filter posts by status', async () => {
      const result = await blogRPC.methods.getAllPosts(
        { agentId: 'test-agent-id', status: 'published' },
        app
      );

      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].status).toBe('published');
      expect(result.count).toBe(1);
    });

    it('should filter posts by tag', async () => {
      const result = await blogRPC.methods.getAllPosts(
        { agentId: 'test-agent-id', tag: 'published' },
        app
      );

      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].tags).toContain('published');
    });

    it('should limit the number of results', async () => {
      const result = await blogRPC.methods.getAllPosts(
        { agentId: 'test-agent-id', limit: 1 },
        app
      );

      expect(result.posts).toHaveLength(1);
      expect(result.count).toBe(2); // Total count, not limited
      expect(result.message).toContain('showing 1');
    });

    it('should return the currently selected post ID', async () => {
      await testProvider.selectPostById('post-2', agent);
      
      const result = await blogRPC.methods.getAllPosts(
        { agentId: 'test-agent-id' },
        app
      );

      expect(result.currentlySelected).toBe('post-2');
    });
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      const result = await blogRPC.methods.createPost(
        {
          agentId: 'test-agent-id',
          title: 'New Post',
          contentInMarkdown: '# Header\n\nContent here',
          tags: ['new']
        },
        app
      );

      expect(result.post).toBeTruthy();
      expect(result.post.title).toBe('New Post');
      expect(result.post.tags).toEqual(['new']);
      expect(result.post.status).toBe('draft');
      expect(result.message).toContain('Post created with ID:');
      expect(result.post.content).toContain('<h1>Header</h1>');
    });

    it('should strip markdown headers from content', async () => {
      const result = await blogRPC.methods.createPost(
        {
          agentId: 'test-agent-id',
          title: 'Post with Header',
          contentInMarkdown: '# Title\n\nActual content'
        },
        app
      );

      expect(result.post.content).not.toContain('# Title');
      expect(result.post.content).toContain('Actual content');
    });
  });

  describe('updatePost', () => {
    beforeEach(async () => {
      await testProvider.selectPostById('post-1', agent);
    });

    it('should update post title', async () => {
      const result = await blogRPC.methods.updatePost(
        {
          agentId: 'test-agent-id',
          title: 'Updated Title'
        },
        app
      );

      expect(result.post.title).toBe('Updated Title');
      expect(result.message).toContain('Post updated');
    });

    it('should update post content', async () => {
      const result = await blogRPC.methods.updatePost(
        {
          agentId: 'test-agent-id',
          contentInMarkdown: 'New content'
        },
        app
      );

      expect(result.post.content).toContain('New content');
    });

    it('should update post status', async () => {
      const result = await blogRPC.methods.updatePost(
        {
          agentId: 'test-agent-id',
          status: 'published'
        },
        app
      );

      expect(result.post.status).toBe('published');
    });

    it('should update post tags', async () => {
      const result = await blogRPC.methods.updatePost(
        {
          agentId: 'test-agent-id',
          tags: ['updated', 'tags']
        },
        app
      );

      expect(result.post.tags).toEqual(['updated', 'tags']);
    });

    it('should update feature image', async () => {
      const featureImage = { id: 'img-1', url: 'https://example.com/img.jpg' };
      const result = await blogRPC.methods.updatePost(
        {
          agentId: 'test-agent-id',
          feature_image: featureImage
        },
        app
      );

      expect(result.post.feature_image).toEqual(featureImage);
    });
  });

  describe('selectPostById', () => {
    it('should select a post by ID', async () => {
      const result = await blogRPC.methods.selectPostById(
        { agentId: 'test-agent-id', id: 'post-2' },
        app
      );

      expect(result.post.id).toBe('post-2');
      expect(result.post.title).toBe('Test Post 2');
      expect(result.message).toContain('Test Post 2');
      expect(testProvider.currentPostId).toBe('post-2');
    });

    it('should throw error when post not found', async () => {
      await expect(
        blogRPC.methods.selectPostById(
          { agentId: 'test-agent-id', id: 'non-existent' },
          app
        )
      ).rejects.toThrow('Post not found');
    });
  });

  describe('clearCurrentPost', () => {
    beforeEach(async () => {
      await testProvider.selectPostById('post-1', agent);
    });

    it('should clear the current post selection', async () => {
      const result = await blogRPC.methods.clearCurrentPost(
        { agentId: 'test-agent-id' },
        app
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('Post selection cleared');
      expect(testProvider.currentPostId).toBeNull();
    });
  });

  describe('publishPost', () => {
    it('should publish the current post', async () => {
      await testProvider.selectPostById('post-1', agent);
      
      const result = await blogRPC.methods.publishPost(
        { agentId: 'test-agent-id' },
        app
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('has been published');
    });

    it('should return error when no post is selected', async () => {
      testProvider.currentPostId = null;
      
      const result = await blogRPC.methods.publishPost(
        { agentId: 'test-agent-id' },
        app
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('No post is currently selected');
    });

    it('should return error when post is already published', async () => {
      await testProvider.selectPostById('post-2', agent);
      
      const result = await blogRPC.methods.publishPost(
        { agentId: 'test-agent-id' },
        app
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('already published');
    });
  });

  describe('generateImageForPost', () => {
    beforeEach(async () => {
      await testProvider.selectPostById('post-1', agent);
    });

    it('should generate and set image for post', async () => {
      const result = await blogRPC.methods.generateImageForPost(
        {
          agentId: 'test-agent-id',
          prompt: 'A beautiful sunset',
          aspectRatio: 'square'
        },
        app
      );

      expect(result.success).toBe(true);
      expect(result.imageUrl).toBe('https://cdn.example.com/test-image.png');
      expect(result.message).toContain('Image generated');
      expect(mockImageModelRegistry.getClient).toHaveBeenCalledWith('test-model');
      expect(mockCdnService.upload).toHaveBeenCalled();
    });

    it('should use different aspect ratios', async () => {
      const sizes = {
        square: '1024x1024',
        tall: '1024x1536',
        wide: '1536x1024'
      };

      for (const [ratio, expectedSize] of Object.entries(sizes)) {
        await blogRPC.methods.generateImageForPost(
          {
            agentId: 'test-agent-id',
            prompt: 'Test prompt',
            aspectRatio: ratio as any
          },
          app
        );

        const imageClient = await mockImageModelRegistry.getClient('test-model');
        expect(imageClient.generateImage).toHaveBeenCalledWith(
          expect.objectContaining({ size: expectedSize }),
          agent
        );
      }
    });

    it('should throw error when prompt is missing', async () => {
      await expect(
        blogRPC.methods.generateImageForPost(
          {
            agentId: 'test-agent-id',
            prompt: ''
          },
          app
        )
      ).rejects.toThrow('Prompt is required');
    });

    it('should throw error when no post is selected', async () => {
      testProvider.currentPostId = null;
      
      await expect(
        blogRPC.methods.generateImageForPost(
          {
            agentId: 'test-agent-id',
            prompt: 'Test'
          },
          app
        )
      ).rejects.toThrow('No post currently selected');
    });
  });

  describe('getActiveProvider', () => {
    it('should return the active provider', async () => {
      const result = await blogRPC.methods.getActiveProvider(
        { agentId: 'test-agent-id' },
        app
      );

      expect(result.provider).toBeTruthy();
      expect(result.availableProviders).toContain('test');
    });
  });

  describe('setActiveProvider', () => {
    it('should set the active provider', async () => {
      const result = await blogRPC.methods.setActiveProvider(
        {
          agentId: 'test-agent-id',
          name: 'test'
        },
        app
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('Active provider set to: test');
      expect(agent.mutateState).toHaveBeenCalled();
    });

    it('should return error for invalid provider', async () => {
      const result = await blogRPC.methods.setActiveProvider(
        {
          agentId: 'test-agent-id',
          name: 'invalid-provider'
        },
        app
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
      expect(result.message).toContain('Available providers');
    });
  });
});
