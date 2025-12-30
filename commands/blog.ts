import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import createSubcommandRouter from "@tokenring-ai/agent/util/subcommandRouter";
import post from "./blog/post.ts";
import provider from "./blog/provider.ts";
import {test} from "./blog/test.ts";

const description = "/blog [action] [subaction] - Manage blog posts";

const help: string = `# Blog Command

Manage blog posts and providers.

## Usage

\`/blog [action] [subaction]\`

## Actions

### Provider Management

#### \`provider select\`
Select an active blog provider interactively.
- Opens a selection interface to choose from available providers
- Auto-selects if only one provider is configured
- Shows current active provider in the list

#### \`provider set <name>\`
Set a specific blog provider by name.
- Directly sets the active provider without interactive selection
- Validates that the provider exists

### Post Management

#### \`post select\`
Select an existing article or clear selection.
- Opens a tree selection interface to choose from available posts
- Shows post status (📝 published, 🔒 draft) and last updated date
- Includes option to clear current selection
- Requires an active provider to be set first

#### \`post info\`
Display information about the currently selected post.
- Shows title, status, dates, word count, tags, and URL
- Requires a post to be selected first

#### \`post clear\`
Clears the current post selection.
- Starts fresh with no post selected
- Use this to begin creating a new post
- Requires an active provider to be set first

#### \`post publish\`
Publish the currently selected post.
- Changes post status from draft to published
- Requires a post to be selected first

### Testing

#### \`test\`
Test blog connection by creating a post and uploading an image.
- Lists current posts
- Creates a test post
- Uploads hello.png image
- Updates the test post with the image

## Examples

\`\`\`
/blog provider select
/blog provider set wordpress
/blog post select
/blog post info
/blog post clear
/blog post publish
/blog test
\`\`\`
`;

const execute = createSubcommandRouter({
  provider,
  post,
  test
});

export default {
  description,
  execute,
  help,
} satisfies TokenRingAgentCommand
