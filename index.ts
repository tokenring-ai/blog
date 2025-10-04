import {AgentTeam, TokenRingPackage} from "@tokenring-ai/agent";
import {z} from "zod";
import BlogService from "./BlogService.ts";
import * as chatCommands from "./chatCommands.ts";
import packageJSON from './package.json' with {type: 'json'};
import * as tools from "./tools.ts";

export const BlogConfigSchema = z.object({
  providers: z.record(z.string(), z.any())
}).optional();

export const packageInfo: TokenRingPackage = {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(agentTeam: AgentTeam) {
    const config = agentTeam.getConfigSlice('blog', BlogConfigSchema);
    if (config) {
      const service = new BlogService();
      agentTeam.services.register(service);
    }
    agentTeam.addTools(packageInfo, tools);
    agentTeam.addChatCommands(chatCommands);
  },
};

export {default as BlogService} from "./BlogService.ts";