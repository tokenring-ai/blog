import {TokenRingPackage} from "@tokenring-ai/agent";
import packageJSON from './package.json' with {type: 'json'};

export const packageInfo: TokenRingPackage = {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  tools,
  chatCommands,
};

export {default as BlogService} from "./BlogService.ts";
import * as tools from "./tools.ts";
import * as chatCommands from "./chatCommands.ts";