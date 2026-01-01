import createSubcommandRouter from "@tokenring-ai/agent/util/subcommandRouter";
import {get} from "./provider/get.ts";
import {reset} from "./provider/reset.ts";
import {select} from "./provider/select.ts";
import {set} from "./provider/set.ts";

export default createSubcommandRouter({
  get,
  set,
  select,
  reset,
})
