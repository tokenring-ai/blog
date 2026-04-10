import type Agent from "@tokenring-ai/agent/Agent";
import CDNService from "@tokenring-ai/cdn/CDNService";
import type {TokenRingToolDefinition} from "@tokenring-ai/chat/schema";
import {ImageGenerationService} from "@tokenring-ai/image-generation";
import {z} from "zod";
import BlogService from "../BlogService.ts";

const name = "blog_generateImageForPost";
const displayName = "Blog/generateImageForPost";

async function execute(args: z.output<typeof inputSchema>, agent: Agent) {
  const imageService = agent.requireServiceByType(ImageGenerationService);
  const blogService = agent.requireServiceByType(BlogService);
  const cdnService = agent.requireServiceByType(CDNService);

  const activeBlog = blogService.requireActiveBlogProvider(agent);

  const currentPost = blogService.getCurrentPost(agent);
  if (!currentPost) {
    throw new Error(`No post currently selected`);
  }

  agent.infoMessage(
    `[${name}] Generating image for post "${currentPost.title}"`,
  );
  const imageResult = await imageService.generateImage(args, agent);

  const uploadResult = await cdnService.upload(
    activeBlog.cdnName,
    imageResult.buffer,
    {
      filename: imageResult.fileName,
      contentType: imageResult.mediaType,
    },
  );

  agent.infoMessage(`[${name}] Image uploaded: ${uploadResult.url}`);

  // Update the current post with the featured image
  await blogService.updateCurrentPost(
    {
      feature_image: {
        id: uploadResult.id,
        url: uploadResult.url,
      },
    },
    agent,
  );

  return {
    type: "json" as const,
    data: {
      success: true,
      imageUrl: uploadResult.url,
      message: `Image generated and set as featured image for post "${currentPost.title}"`,
    },
  };
}

const description = "Generate an AI image for the currently selected blog post";

const inputSchema = z.object({
  prompt: z.string().describe("Description of the image to generate"),
  aspectRatio: z.enum(["square", "tall", "wide"]).default("square"),
});

export default {
  name,
  displayName,
  description,
  inputSchema,
  execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;
