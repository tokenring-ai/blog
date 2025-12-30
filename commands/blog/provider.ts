import createSubcommandRouter from "@tokenring-ai/agent/util/subcommandRouter";
import {select} from "./provider/select.ts";
import {set} from "./provider/set.ts";

export default createSubcommandRouter({
  set,
  select,
})
