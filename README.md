# SuperPost SDK

The official SDK for interacting with the SuperPost REST API. Provide a seamless experience for publishing, drafting, scheduling, and deleting social media posts across your connected accounts.

## Installation

You can install the SDK using npm, yarn, pnpm, or bun:

```bash
npm install @superpost/sdk
# or
yarn add @superpost/sdk
# or
pnpm add @superpost/sdk
# or
bun add @superpost/sdk
```

## Getting Started

Initialize the client with your API key.

```typescript
import { SuperPost } from "@superpost/sdk";

const client = new SuperPost({
  apiKey: "YOUR_SUPERPOST_API_KEY",
});
```

## Usage

### Publishing a Post

Publish a new post immediately to your targeted accounts. You can also pass an existing `id` to publish a saved draft.

```typescript
const response = await client.publish({
  content: "Hello from the SuperPost SDK! 🚀",
  accounts: ["account_id_1", "account_id_2"],
  // Optional: Attach media files
  // files: ["/path/to/image.png"]
});

console.log(`Published post with ID: ${response.postId}`);
if (response.success) {
  console.log("Published successfully to all accounts!");
} else {
  console.log("Partial publish results:", response.results);
}
```

### Saving a Draft

Save a post as a draft without publishing it.

```typescript
const response = await client.draft({
  content: "Working on an upcoming announcement...",
  // Optional: Target specific accounts
  accounts: ["account_id_1"],
});

console.log(`Draft saved with ID: ${response.postId}`);
```

### Scheduling a Post

Schedule a post for future publication. The scheduled time must be at least 10 minutes in the future.

```typescript
const futureDate = new Date();
futureDate.setHours(futureDate.getHours() + 1);

const response = await client.schedule({
  content: "This post will go live in an hour! ⏰",
  accounts: ["account_id_1"],
  scheduledAt: futureDate,
});

console.log(`Post scheduled for ${response.scheduledAt}`);
```

### Deleting a Post

Delete an existing post, draft, or scheduled post.

```typescript
const response = await client.delete({
  postId: "existing_post_id",
});

if (response.success) {
  console.log("Post deleted successfully.");
}
```

## Error Handling

The SDK throws a `SuperPostError` if an API request fails. You can catch this to handle specific HTTP status codes or API error messages.

```typescript
import { SuperPostError } from "@superpost/sdk";

try {
  await client.publish({
    content: "...",
    accounts: ["invalid_account_id"]
  });
} catch (error) {
  if (error instanceof SuperPostError) {
    console.error(`API Error (${error.status}):`, error.message);
    console.error("Details:", error.response);
  } else {
    console.error("An unexpected error occurred:", error);
  }
}
```

## License

MIT