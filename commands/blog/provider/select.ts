import Agent from "@tokenring-ai/agent/Agent";
import type {TreeLeaf} from "@tokenring-ai/agent/question";
import BlogService from "../../../BlogService.ts";
import {BlogState} from "../../../state/BlogState.ts";

export async function select(remainder: string, agent: Agent): Promise<void> {
  const blogService = agent.requireServiceByType(BlogService);
  const availableBlogs = blogService.getAvailableBlogs();

  if (availableBlogs.length === 0) {
    agent.infoMessage("No blog providers are registered.");
    return;
  }

  if (availableBlogs.length === 1) {
    blogService.setActiveProvider(availableBlogs[0], agent);
    agent.infoMessage(`Only one provider configured, auto-selecting: ${availableBlogs[0]}`);
    return;
  }

  const activeProvider = agent.getState(BlogState).activeProvider;
  const formattedBlogs: TreeLeaf[] = availableBlogs.map(name => ({
    name: `${name}${name === activeProvider ? " (current)" : ""}`,
    value: name,
  }));

  const selection = await agent.askQuestion({
    message: "Select an active blog provider",
    question: {
      type: 'treeSelect',
      label: "Blog Provider Selection",
      key: "result",
      defaultValue: activeProvider ? [activeProvider] : undefined,
      minimumSelections: 1,
      maximumSelections: 1,
      tree: formattedBlogs
    }
  });

  if (selection) {
    const selectedValue = selection[0];
    blogService.setActiveProvider(selectedValue, agent);
    agent.infoMessage(`Active provider set to: ${selectedValue}`);
  } else {
    agent.infoMessage("Provider selection cancelled.");
  }
}