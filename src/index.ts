import { API_BASE_URL } from "./config";
import type {
  SuperPostOptions,
  PublishOptions,
  DraftOptions,
  ScheduleOptions,
  DeleteOptions,
  PublishResponse,
  DraftResponse,
  ScheduleResponse,
  DeleteResponse,
} from "./types";
import { SuperPostError } from "./types";
import { buildFormData } from "./utils";

export * from "./types";

/**
 * Client for SuperPost REST API.
 * Provides methods to publish, draft, schedule, and delete posts across connected social media accounts.
 */
export class SuperPost {
  private apiKey: string;
  private baseUrl: string;

  /**
   * Initializes a new instance of the SuperPost client.
   *
   * @param options - Configuration options for the client.
   * @throws {Error} If the API key is not provided.
   */
  constructor(options: SuperPostOptions) {
    if (!options || !options.apiKey) {
      throw new Error("API Key is required");
    }
    this.apiKey = options.apiKey;
    this.baseUrl = API_BASE_URL;
  }

  private async fetchApi<T>(endpoint: string, options: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    options.headers = {
      ...options.headers,
      "Authorization": `Bearer ${this.apiKey}`
    };
    const response = await fetch(url, options);

    let data: any;
    try {
      data = await response.json();
    } catch {
      throw new SuperPostError(
        `Failed to parse response as JSON. Status: ${response.status}`,
        response.status,
        null
      );
    }

    if (!response.ok || (data && !data.success && response.status !== 207)) {
      throw new SuperPostError(
        data.error || `API Request Failed with status ${response.status}`,
        response.status,
        data
      );
    }

    return data as T;
  }

  /**
   * Publishes a post to one or more connected social media accounts.
   * If `id` is provided, it updates an existing draft and publishes it; otherwise creates a new post.
   *
   * @param options - The options containing content, targeted accounts, and optional media files.
   * @returns A promise that resolves to the publish operation response, detailing success or partial failures.
   * @throws {SuperPostError} If the API returns a non-2xx status code or a failure indicator.
   */
  public async publish(options: PublishOptions): Promise<PublishResponse> {
    const formData = await buildFormData({ ...options, apiKey: this.apiKey });
    return this.fetchApi<PublishResponse>("/post/publish", {
      method: "POST",
      body: formData,
    });
  }

  /**
   * Saves a post as a draft without publishing.
   * If `id` is provided, it updates the existing draft; otherwise creates a new one.
   *
   * @param options - The options containing content and optional targeted accounts or media files.
   * @returns A promise that resolves to the draft operation response.
   * @throws {SuperPostError} If the API returns a non-2xx status code or a failure indicator.
   */
  public async draft(options: DraftOptions): Promise<DraftResponse> {
    const formData = await buildFormData({ ...options, apiKey: this.apiKey });
    return this.fetchApi<DraftResponse>("/post/draft", {
      method: "POST",
      body: formData,
    });
  }

  /**
   * Schedules a post for future publication.
   * If `id` is provided, it converts an existing draft to a scheduled post; otherwise creates a new scheduled post.
   * The scheduled time must be at least 10 minutes in the future.
   *
   * @param options - The options containing content, targeted accounts, scheduled time, and optional media files.
   * @returns A promise that resolves to the schedule operation response.
   * @throws {SuperPostError} If the scheduled time is invalid, or if the API returns a failure indicator.
   */
  public async schedule(options: ScheduleOptions): Promise<ScheduleResponse> {
    const formData = await buildFormData({ ...options, apiKey: this.apiKey });
    return this.fetchApi<ScheduleResponse>("/post/schedule", {
      method: "POST",
      body: formData,
    });
  }

  /**
   * Deletes an existing post, draft, or scheduled post and its associated media attachments.
   *
   * @param options - The options containing the post ID to delete.
   * @returns A promise that resolves to the delete operation response.
   * @throws {SuperPostError} If the API returns a non-2xx status code or a failure indicator.
   */
  public async delete(options: DeleteOptions): Promise<DeleteResponse> {
    return this.fetchApi<DeleteResponse>("/post/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey: this.apiKey,
        postId: options.postId,
      }),
    });
  }
}
