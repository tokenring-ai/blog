import Agent from "@tokenring-ai/agent/Agent";
import type {TreeLeaf} from "@tokenring-ai/agent/question";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import BlogService from "../../../BlogService.ts";
import {BlogState} from "../../../state/BlogState.ts";

async function execute(_remainder: string, agent: Agent): Promise<string> {
  const blogService = agent.requireServiceByType(BlogService);
  const available = blogService.getAvailableBlogs();
  if (available.length === 0) return "No blog providers are registered.";
  if (available.length === 1) {
    blogService.setActiveProvider(available[0], agent);
    return `Only one provider configured, auto-selecting: ${available[0]}`;
  }
  const activeProvider = agent.getState(BlogState).activeProvider;
  const tree: TreeLeaf[] = available.map(name => ({ name: `${name}${name === activeProvider ? " (current)" : ""}`, value: name }));
  const selection = await agent.askQuestion({
    message: "Select an active blog provider",
    question: { type: 'treeSelect', label: "Blog Provider Selection", key: "result", defaultValue: activeProvider ? [activeProvider] : undefined, minimumSelections: 1, maximumSelections: 1, tree },
  });
  if (selection) {
    blogService.setActiveProvider(selection[0], agent);
    return `Active provider set to: ${selection[0]}`;
  }
  return "Provider selection cancelled.";
}

const help = `# /blog provider select

Interactively select the active blog provider. Auto-selects if only one provider is configured.

## Example

/blog provider select`;

export default { name: "blog provider select", description: "/blog provider select - Interactively select a provider", help, execute } satisfies TokenRingAgentCommand;
