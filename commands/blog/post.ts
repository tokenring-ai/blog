import createSubcommandRouter from "@tokenring-ai/agent/util/subcommandRouter";
import {clear} from "./post/clear.ts";
import {info} from "./post/info.ts";
import {publish} from "./post/publish.ts";
import {select} from "./post/select.ts";

export default createSubcommandRouter({
  select,
  info,
  clear,
  publish,
})
