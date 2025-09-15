import {TokenRingPackage} from "@tokenring-ai/agent";
import packageJSON from './package.json' with {type: 'json'};

export const packageInfo: TokenRingPackage = {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description
};

export {default as BlogService} from "./BlogService.ts";
export {default as BlogResource} from "./BlogResource.ts";
export * as tools from "./tools.ts";
export * as chatCommands from "./chatCommands.ts";