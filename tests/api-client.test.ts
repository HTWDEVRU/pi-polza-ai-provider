import { describe, it, expect, vi, afterEach } from "vitest";
import { PolzaModelsClient } from "../src/api-client";

describe("PolzaModelsClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return empty array when no API key is provided", async () => {
    const client = new PolzaModelsClient("");
    const models = await client.fetchChatModels();

    expect(models).toEqual([]);
  });

  it("should return empty array when API responds with error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 401 })
    );

    const client = new PolzaModelsClient("test-key");
    const models = await client.fetchChatModels();

    expect(models).toEqual([]);
  });

  it("should return empty array when no chat models found", async () => {
    const mockData = {
      data: [
        {
          id: "text-only",
          name: "Text Model",
          type: "text",
          top_provider: {
            context_length: 8192,
            max_completion_tokens: 2048,
          },
        },
      ],
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    const client = new PolzaModelsClient("test-key");
    const models = await client.fetchChatModels();

    expect(models).toEqual([]);
  });

  it("should return empty array when API response has no data field", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 })
    );

    const client = new PolzaModelsClient("test-key");
    const models = await client.fetchChatModels();

    expect(models).toEqual([]);
  });

  it("should return chat models with correct structure", async () => {
    const mockData = {
      data: [
        {
          id: "claude-3-5-sonnet",
          name: "Claude 3.5 Sonnet",
          type: "chat",
          top_provider: {
            context_length: 200000,
            max_completion_tokens: 8192,
            pricing: {
              prompt_per_million: "3",
              completion_per_million: "15",
            },
          },
        },
        {
          id: "gpt-4o",
          name: "GPT-4 Optimal",
          type: "chat",
          top_provider: {
            context_length: 128000,
            max_completion_tokens: 4096,
          },
        },
      ],
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    const client = new PolzaModelsClient("test-key");
    const models = await client.fetchChatModels();

    expect(models.length).toBe(2);

    expect(models[0]).toMatchObject({
      id: "claude-3-5-sonnet",
      name: "Claude 3.5 Sonnet",
      reasoning: false,
      input: ["text"],
      cost: {
        input: 3,
        output: 15,
        cacheRead: 0,
        cacheWrite: 0,
      },
      contextWindow: 200000,
      maxTokens: 8192,
    });

    expect(models[1]).toMatchObject({
      id: "gpt-4o",
      name: "GPT-4 Optimal",
      contextWindow: 128000,
      maxTokens: 4096,
    });
  });

  it("should return empty array on fetch error", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("Network error")
    );

    const client = new PolzaModelsClient("test-key");
    const models = await client.fetchChatModels();

    expect(models).toEqual([]);
  });

  it("should use custom baseUrl when provided", async () => {
    const mockData = {
      data: [
        {
          id: "custom-model",
          name: "Custom Model",
          type: "chat",
          top_provider: {
            context_length: 4096,
            max_completion_tokens: 1024,
          },
        },
      ],
    };

    let capturedUrl = "";
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      capturedUrl = typeof url === "string" ? url : url.toString();
      return Promise.resolve(
        new Response(JSON.stringify(mockData), { status: 200 })
      );
    });

    const client = new PolzaModelsClient("test-key", "https://custom.api/v2");
    await client.fetchChatModels();

    expect(capturedUrl).toBe("https://custom.api/v2/models?type=chat&include_providers=true");
  });
});
