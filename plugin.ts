import {AgentCommandService} from "@tokenring-ai/agent";
import {TokenRingPlugin} from "@tokenring-ai/app";
import {ChatService} from "@tokenring-ai/chat";
import {RpcService} from "@tokenring-ai/rpc";
import {ScriptingService} from "@tokenring-ai/scripting";
import {ScriptingThis} from "@tokenring-ai/scripting/ScriptingService";
import {z} from "zod";
import BlogService from "./BlogService.ts";
import chatCommands from "./chatCommands.ts";
import {BlogConfigSchema} from "./index.ts";
import packageJSON from './package.json' with {type: 'json'};
import blogRPC from "./rpc/blog.ts";
import tools from "./tools.ts";

const packageConfigSchema = z.object({
  blog: BlogConfigSchema.optional()
});

export default {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(app, config) {
    if (! config.blog) return;
    const service = new BlogService(config.blog);
    app.services.register(service);

    app.services.waitForItemByType(ScriptingService, (scriptingService: ScriptingService) => {
      scriptingService.registerFunction(
        "createPost", {
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
        }
      );

      scriptingService.registerFunction("getCurrentPost", {
          type: 'native',
          params: [],
          async execute(this: ScriptingThis): Promise<string> {
            const post = this.agent.requireServiceByType(BlogService).getCurrentPost(this.agent);
            return post ? JSON.stringify(post) : 'No post selected';
          }
        }
      );

      scriptingService.registerFunction("getAllPosts", {
          type: 'native',
          params: [],
          async execute(this: ScriptingThis): Promise<string> {
            const posts = await this.agent.requireServiceByType(BlogService).getAllPosts(this.agent);
            return JSON.stringify(posts);
          }
        }
      );
    });

    app.waitForService(ChatService, chatService =>
      chatService.addTools(tools)
    );
    app.waitForService(AgentCommandService, agentCommandService =>
      agentCommandService.addAgentCommands(chatCommands)
    );

    app.waitForService(RpcService, rpcService => {
      rpcService.registerEndpoint(blogRPC);
    })
  },
  config: packageConfigSchema
} satisfies TokenRingPlugin<typeof packageConfigSchema>;
