import Agent from "@tokenring-ai/agent/Agent";
import ModelRegistry from "@tokenring-ai/ai-client/ModelRegistry";
import CDNService from "@tokenring-ai/cdn/CDNService";
import {Buffer} from "node:buffer";
import {v4 as uuid} from "uuid";
import {z} from "zod";
import BlogService from "../BlogService.ts";
import {BlogState} from "../state/BlogState.js";

export const name = "blog/generateImageForPost";

export async function execute(
  {prompt, aspectRatio = "square"}: {
    prompt?: string;
    aspectRatio?: "square" | "tall" | "wide";
  },
  agent: Agent,
) {
  const blogService = agent.requireServiceByType(BlogService);
  const cdnService = agent.requireServiceByType(CDNService);
  const modelRegistry = agent.requireServiceByType(ModelRegistry);
  if (!prompt) {
    throw new Error("Prompt is required");
  }

  const activeBlog = blogService.requireActiveBlogProvider(agent);

  const currentPost = activeBlog.getCurrentPost(agent);
  if (!currentPost) {
    throw new Error(`No post currently selected`);
  }

  agent.infoLine(`[${name}] Generating image for post "${currentPost.title}"`);

  const imageClient = await modelRegistry.imageGeneration.getFirstOnlineClient(activeBlog.imageGenerationModel);

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
    feature_image: uploadResult.url
  },agent);

  return {
    success: true,
    imageUrl: uploadResult.url,
    message: `Image generated and set as featured image for post "${currentPost.title}"`,
  };
}

export const description = "Generate an AI image for the currently selected blog post";

export const inputSchema = z.object({
  prompt: z.string().describe("Description of the image to generate"),
  aspectRatio: z.enum(["square", "tall", "wide"]).default("square").optional(),
});