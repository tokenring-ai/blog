import Agent from "@tokenring-ai/agent/Agent";
import {ImageGenerationModelRegistry} from "@tokenring-ai/ai-client/ModelRegistry";
import CDNService from "@tokenring-ai/cdn/CDNService";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/schema";
import {Buffer} from "node:buffer";
import {v4 as uuid} from "uuid";
import {z} from "zod";
import BlogService from "../BlogService.ts";

const name = "blog_generateImageForPost";

async function execute(
  {prompt, aspectRatio = "square"}: z.infer<typeof inputSchema>,
  agent: Agent,
) {
  const blogService = agent.requireServiceByType(BlogService);
  const cdnService = agent.requireServiceByType(CDNService);
  const imageModelRegistry = agent.requireServiceByType(ImageGenerationModelRegistry);
  if (!prompt) {
    throw new Error("Prompt is required");
  }

  const activeBlog = blogService.requireActiveBlogProvider(agent);

  const currentPost = activeBlog.getCurrentPost(agent);
  if (!currentPost) {
    throw new Error(`No post currently selected`);
  }

  agent.infoLine(`[${name}] Generating image for post "${currentPost.title}"`);

  const imageClient = await imageModelRegistry.getClient(activeBlog.imageGenerationModel);

  let size: `${number}x${number}`;
  switch (aspectRatio) {
    case "square": size = "1024x1024"; break;
    case "tall": size = "1024x1536"; break;
    case "wide": size = "1536x1024"; break;
    default: size = "1024x1024";
  }

  const [imageResult] = await imageClient.generateImage({prompt, size, n: 1}, agent);

  const extension = imageResult.mediaType.split("/")[1];
  const filename = `${uuid()}.${extension}`;
  const imageBuffer = Buffer.from(imageResult.uint8Array);


  const uploadResult = await cdnService.upload(activeBlog.cdnName, imageBuffer, {
    filename,
    contentType: imageResult.mediaType,
  });

  agent.infoLine(`[${name}] Image uploaded: ${uploadResult.url}`);

  // Update the current post with the featured image
  await blogService.updatePost({
    feature_image: {
      id: uploadResult.id,
      url: uploadResult.url
    }
  },agent);

  return {
    success: true,
    imageUrl: uploadResult.url,
    message: `Image generated and set as featured image for post "${currentPost.title}"`,
  };
}

const description = "Generate an AI image for the currently selected blog post";

const inputSchema = z.object({
  prompt: z.string().describe("Description of the image to generate"),
  aspectRatio: z.enum(["square", "tall", "wide"]).default("square").optional(),
});

export default {
  name, description, inputSchema, execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;