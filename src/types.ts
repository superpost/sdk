/**
 * Configuration options for initializing the SuperPost client.
 */
export interface SuperPostOptions {
  /**
   * The API key for your SuperPost account.
   */
  apiKey: string;
}

/**
 * Options for publishing a new post or an existing draft.
 */
export interface PublishOptions {
  /**
   * Optional. Existing draft post ID to publish. If provided, updates the existing draft and publishes it.
   */
  id?: string;
  /**
   * The text content of the post.
   */
  content: string;
  /**
   * Array of platform account IDs to publish the post to.
   */
  accounts: string[];
  /**
   * Optional media files (images or videos) to attach to the post.
   * Can be a Browser `File`, `Blob`, Node.js `Buffer`, or string path to a file.
   */
  files?: File[] | Blob[] | Buffer[] | string[];
}

/**
 * Options for saving or updating a draft post.
 */
export interface DraftOptions {
  /**
   * Optional. Existing draft post ID to update. If omitted, a new draft is created.
   */
  id?: string;
  /**
   * The text content of the draft post.
   */
  content: string;
  /**
   * Optional. Array of platform account IDs the draft is targeted for.
   */
  accounts?: string[];
  /**
   * Optional media files (images or videos) to attach to the draft.
   * Can be a Browser `File`, `Blob`, Node.js `Buffer`, or string path to a file.
   */
  files?: File[] | Blob[] | Buffer[] | string[];
}

/**
 * Options for scheduling a post for future publication.
 */
export interface ScheduleOptions {
  /**
   * Optional. Existing draft post ID to schedule. If provided, converts the draft to a scheduled post.
   */
  id?: string;
  /**
   * The text content of the scheduled post.
   */
  content: string;
  /**
   * Array of platform account IDs to publish the post to.
   */
  accounts: string[];
  /**
   * The date and time when the post should be published.
   * Must be at least 10 minutes in the future.
   */
  scheduledAt: Date | string | number;
  /**
   * Optional media files (images or videos) to attach to the scheduled post.
   * Can be a Browser `File`, `Blob`, Node.js `Buffer`, or string path to a file.
   */
  files?: File[] | Blob[] | Buffer[] | string[];
}

/**
 * Options for deleting an existing post or draft.
 */
export interface DeleteOptions {
  /**
   * The unique identifier of the post to delete.
   */
  postId: string;
}

/**
 * The individual result of a publish operation for a specific social platform.
 */
export interface PlatformResult {
  /**
   * The internal account ID the post was targeted to.
   */
  accountId: string;
  /**
   * The platform the account belongs to.
   */
  platform: "x" | "linkedin" | "instagram" | "facebook";
  /**
   * Whether the publish operation was successful on this platform.
   */
  success: boolean;
  /**
   * Optional. The native post ID returned by the platform if successful.
   */
  platformPostId?: string;
  /**
   * Optional. Error message if the publish operation failed for this platform.
   */
  error?: string;
}

/**
 * Response received after attempting to publish a post.
 */
export interface PublishResponse {
  /**
   * Indicates overall success. True if all platforms succeeded, false if any failed.
   */
  success: boolean;
  /**
   * The unique identifier of the post in the SuperPost system.
   */
  postId: string;
  /**
   * Detailed results for each platform the post was targeted to.
   */
  results: PlatformResult[];
}

/**
 * Response received after saving or updating a draft post.
 */
export interface DraftResponse {
  /**
   * Indicates if the draft was successfully saved.
   */
  success: boolean;
  /**
   * The unique identifier of the draft post.
   */
  postId: string;
}

/**
 * Response received after successfully scheduling a post.
 */
export interface ScheduleResponse {
  /**
   * Indicates if the post was successfully scheduled.
   */
  success: boolean;
  /**
   * The unique identifier of the scheduled post.
   */
  postId: string;
  /**
   * The ISO 8601 string representation of the scheduled time.
   */
  scheduledAt: string;
}

/**
 * Response received after deleting a post.
 */
export interface DeleteResponse {
  /**
   * Indicates if the post was successfully deleted.
   */
  success: boolean;
  /**
   * The unique identifier of the deleted post.
   */
  postId: string;
}

/**
 * Custom error class representing API failures from the SuperPost API.
 */
export class SuperPostError extends Error {
  /**
   * The HTTP status code returned by the API.
   */
  public status: number;
  /**
   * The raw response data returned by the API, if available.
   */
  public response: any;

  /**
   * Creates a new SuperPostError instance.
   * @param message - The error message.
   * @param status - The HTTP status code.
   * @param response - The raw API response body.
   */
  constructor(message: string, status: number, response: any) {
    super(message);
    this.name = "SuperPostError";
    this.status = status;
    this.response = response;
  }
}
