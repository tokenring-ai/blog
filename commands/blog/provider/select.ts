import Agent from "@tokenring-ai/agent/Agent";
import BlogService from "../../../BlogService.ts";
import {BlogState} from "../../../state/BlogState.ts";

export async function select(remainder: string, agent: Agent): Promise<void> {
  const blogService = agent.requireServiceByType(BlogService);
  const availableBlogs = blogService.getAvailableBlogs();

  if (availableBlogs.length === 0) {
    agent.infoLine("No blog providers are registered.");
    return;
  }

  if (availableBlogs.length === 1) {
    blogService.setActiveProvider(availableBlogs[0], agent);
    agent.infoLine(`Only one provider configured, auto-selecting: ${availableBlogs[0]}`);
    return;
  }

  const activeProvider = agent.getState(BlogState).activeProvider;
  const formattedBlogs = availableBlogs.map(name => ({
    name: `${name}${name === activeProvider ? " (current)" : ""}`,
    value: name,
  }));

  const selectedValue = await agent.askHuman({
    type: "askForSingleTreeSelection",
    title: "Blog Provider Selection",
    message: "Select an active blog provider",
    tree: {name: "Available Providers", children: formattedBlogs}
  });

  if (selectedValue) {
    blogService.setActiveProvider(selectedValue, agent);
    agent.infoLine(`Active provider set to: ${selectedValue}`);
  } else {
    agent.infoLine("Provider selection cancelled.");
  }
}