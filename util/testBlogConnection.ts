import Agent from "@tokenring-ai/agent/Agent";
import CDNService from "@tokenring-ai/cdn/CDNService";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {v4 as uuid} from "uuid";
import BlogService from "../BlogService.js";

export async function testBlogConnection(
  blogService: BlogService,
  agent: Agent
): Promise<void> {
  try {
    const activeBlog = blogService.requireActiveBlogProvider(agent);
    const cdnService = agent.requireServiceByType(CDNService);

    agent.infoMessage("🧪 Testing blog connection...");

    // 1. List current posts
    agent.infoMessage("📋 Listing current posts...");
    const posts = await blogService.getAllPosts(agent);
    agent.infoMessage(`Found ${posts.length} existing posts`);

    // 2. Create test post
    agent.infoMessage("📝 Creating test post...");
    const testPost = await blogService.createPost({
      title: `Blog Test - ${new Date().toISOString()}`,
      content: "<p>This is a test post to validate blog connectivity.</p>",
      tags: ["test"]
    }, agent);
    agent.infoMessage(`Test post created with ID: ${testPost.id}`);

    // 3. Upload hello.png image
    agent.infoMessage("🖼️ Uploading hello.png image...");
    const imagePath = resolve(import.meta.dirname, "..", "hello.png");
    const imageBuffer = readFileSync(imagePath);
    const filename = `test-${uuid()}.png`;

    const uploadResult = await cdnService.upload(activeBlog.cdnName, imageBuffer, {
      filename,
      contentType: "image/png",
    });
    agent.infoMessage(`Image uploaded: ${uploadResult.url}, id: ${uploadResult.id}`);

    // 4. Update post with image
    agent.infoMessage("🔄 Updating post with image...");
    await blogService.updatePost({
      feature_image: {
        id: uploadResult.id,
        url: uploadResult.url
      }
    }, agent);
    agent.infoMessage(`Post updated with featured image`);

    agent.infoMessage("✅ Blog connection test completed successfully!");
  } catch (error) {
    agent.errorMessage("❌ Blog connection test failed:", error as Error);
  }
}