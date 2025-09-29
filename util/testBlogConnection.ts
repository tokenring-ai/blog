import Agent from "@tokenring-ai/agent/Agent";
import CDNService from "@tokenring-ai/cdn/CDNService";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {v4 as uuid} from "uuid";
import BlogService from "../BlogService.js";
import {BlogState} from "../state/BlogState.js";

export async function testBlogConnection(
  blogService: BlogService,
  agent: Agent
): Promise<void> {
  const activeBlogName = agent.getState(BlogState).activeBlogName;
  if (!activeBlogName) {
    agent.infoLine("No active provider selected. Use /blog provider select first.");
    return;
  }

  try {
    const activeBlog = blogService.requireActiveBlogProvider(agent);
    const cdnService = agent.requireServiceByType(CDNService);

    agent.infoLine("🧪 Testing blog connection...");

    // 1. List current posts
    agent.infoLine("📋 Listing current posts...");
    const posts = await blogService.getAllPosts(agent);
    agent.infoLine(`Found ${posts.length} existing posts`);

    // 2. Create test post
    agent.infoLine("📝 Creating test post...");
    const testPost = await blogService.createPost({
      title: `Blog Test - ${new Date().toISOString()}`,
      content: "<p>This is a test post to validate blog connectivity.</p>",
      tags: ["test"]
    }, agent);
    agent.infoLine(`Test post created with ID: ${testPost.id}`);

    // 3. Upload hello.png image
    agent.infoLine("🖼️ Uploading hello.png image...");
    const imagePath = resolve(import.meta.dirname, "..", "hello.png");
    const imageBuffer = readFileSync(imagePath);
    const filename = `test-${uuid()}.png`;

    const uploadResult = await cdnService.upload(activeBlog.cdnName, imageBuffer, {
      filename,
      contentType: "image/png",
    });
    agent.infoLine(`Image uploaded: ${uploadResult.url}, id: ${uploadResult.id}`);

    // 4. Update post with image
    agent.infoLine("🔄 Updating post with image...");
    await blogService.updatePost({
      feature_image: {
        id: uploadResult.id,
        url: uploadResult.url
      }
    }, agent);
    agent.infoLine(`Post updated with featured image`);

    agent.infoLine("✅ Blog connection test completed successfully!");
  } catch (error) {
    agent.errorLine("❌ Blog connection test failed:", error as Error);
  }
}