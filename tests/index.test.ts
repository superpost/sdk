import { describe, it, expect, vi, beforeEach } from "vitest";
import { SuperPost, SuperPostError } from "../src/index";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("SuperPost SDK", () => {
  const apiKey = "sp-testkey123";
  let client: SuperPost;

  beforeEach(() => {
    client = new SuperPost({ apiKey });
    mockFetch.mockReset();
  });

  it("should initialize correctly", () => {
    expect(client).toBeInstanceOf(SuperPost);
    expect(() => new SuperPost({ apiKey: "" } as any)).toThrow("API Key is required");
  });
  it("publish should correctly send formData", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, postId: "post123", results: [] }),
    });

    const res = await client.publish({
      content: "Hello",
      accounts: ["acc1", "acc2"],
      files: [new Blob(["test"], { type: "text/plain" })],
    });

    expect(res.success).toBe(true);
    expect(res.postId).toBe("post123");
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("https://superpost.dev/api/v1/post/publish");
    expect(options.method).toBe("POST");
    expect(options.body).toBeInstanceOf(FormData);

    const formData = options.body as FormData;
    expect(formData.get("apiKey")).toBe(apiKey);
    expect(formData.get("content")).toBe("Hello");
    expect(formData.getAll("accounts")).toEqual(["acc1", "acc2"]);
  });

  it("should handle API errors", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ success: false, error: "Validation failed" }),
    });

    await expect(client.publish({ content: "test", accounts: [] })).rejects.toThrow(SuperPostError);
    await expect(client.publish({ content: "test", accounts: [] })).rejects.toThrow("Validation failed");
  });

  it("should handle schedule", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ success: true, postId: "sch1", scheduledAt: "2026-05-15T14:00:00.000Z" }),
    });

    const date = new Date("2026-05-15T14:00:00.000Z");
    const res = await client.schedule({
      content: "Scheduled post",
      accounts: ["acc1"],
      scheduledAt: date,
    });

    expect(res.success).toBe(true);
    const [, options] = mockFetch.mock.calls[0];
    expect((options.body as FormData).get("scheduledAt")).toBe(date.toISOString());
  });

  it("should handle delete via JSON body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, postId: "del1" }),
    });

    const res = await client.delete({ postId: "del1" });
    expect(res.success).toBe(true);

    const [, options] = mockFetch.mock.calls[0];
    expect(options.method).toBe("DELETE");
    expect(options.headers).toEqual({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    });
    expect(JSON.parse(options.body as string)).toEqual({ apiKey, postId: "del1" });
  });
});
