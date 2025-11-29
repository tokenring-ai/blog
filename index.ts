import {AgentCommandService} from "@tokenring-ai/agent";
import TokenRingApp, {TokenRingPlugin} from "@tokenring-ai/app";
import {ChatService} from "@tokenring-ai/chat";
import {ScriptingService} from "@tokenring-ai/scripting";
import {ScriptingThis} from "@tokenring-ai/scripting/ScriptingService.js";
import {z} from "zod";
import BlogService from "./BlogService.ts";
import chatCommands from "./chatCommands.ts";
import packageJSON from './package.json' with {type: 'json'};
import tools from "./tools.ts";

export const BlogConfigSchema = z.object({
  providers: z.record(z.string(), z.any())
}).optional();

export default {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(app: TokenRingApp) {
    const config = app.getConfigSlice('blog', BlogConfigSchema);
    if (config) {
      const service = new BlogService();
      app.services.register(service);
    }
    app.services.waitForItemByType(ScriptingService).then((scriptingService: ScriptingService) => {
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
      chatService.addTools(packageJSON.name, tools)
    );
    app.waitForService(AgentCommandService, agentCommandService =>
      agentCommandService.addAgentCommands(chatCommands)
    );
  },
} as TokenRingPlugin;

export {default as BlogService} from "./BlogService.ts";