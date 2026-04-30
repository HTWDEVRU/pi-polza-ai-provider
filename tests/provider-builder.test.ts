import { describe, it, expect } from "vitest";
import { buildProviderConfig } from "../src/provider-builder";
import type { ApiModelConfig } from "../src/types";

describe("buildProviderConfig", () => {
  const sampleModels: ApiModelConfig[] = [
    {
      id: "claude-3-5-sonnet",
      name: "Claude 3.5 Sonnet",
      reasoning: false,
      input: ["text"],
      cost: { input: 3, output: 15, cacheRead: 0, cacheWrite: 0 },
      contextWindow: 200000,
      maxTokens: 8192,
    },
    {
      id: "gpt-4o",
      name: "GPT-4 Optimal",
      reasoning: false,
      input: ["text"],
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
      contextWindow: 128000,
      maxTokens: 4096,
    },
  ];

  it("should return a provider config with correct structure", () => {
    const config = buildProviderConfig(
      "https://polza.ai/api/v1",
      "POLZA_AI_API_KEY",
      sampleModels
    );

    expect(config).toMatchObject({
      baseUrl: "https://polza.ai/api/v1",
      apiKey: "POLZA_AI_API_KEY",
      authHeader: true,
      api: "openai-completions",
    });

    expect(config.models).toHaveLength(2);
  });

  it("should convert models to the pi ProviderModelConfig format", () => {
    const config = buildProviderConfig(
      "https://polza.ai/api/v1",
      "POLZA_AI_API_KEY",
      sampleModels
    );

    const model = config.models[0];
    expect(model).toEqual({
      id: "claude-3-5-sonnet",
      name: "Claude 3.5 Sonnet",
      reasoning: false,
      input: ["text"],
      cost: { input: 3, output: 15, cacheRead: 0, cacheWrite: 0 },
      contextWindow: 200000,
      maxTokens: 8192,
    });
  });

  it("should use default baseUrl when not provided", () => {
    const config = buildProviderConfig(undefined, undefined, sampleModels);

    expect(config.baseUrl).toBe("https://polza.ai/api/v1");
    expect(config.apiKey).toBe("POLZA_AI_API_KEY");
  });

  it("should return empty models array when given empty input", () => {
    const config = buildProviderConfig(
      "https://polza.ai/api/v1",
      "POLZA_AI_API_KEY",
      []
    );

    expect(config.models).toEqual([]);
  });

  it("should handle model with image input type", () => {
    const modelsWithImage: ApiModelConfig[] = [
      {
        id: "gpt-4-vision",
        name: "GPT-4 Vision",
        reasoning: false,
        input: ["text", "image"],
        cost: { input: 10, output: 30, cacheRead: 5, cacheWrite: 15 },
        contextWindow: 128000,
        maxTokens: 4096,
      },
    ];

    const config = buildProviderConfig(
      "https://polza.ai/api/v1",
      "POLZA_AI_API_KEY",
      modelsWithImage
    );

    expect(config.models[0].input).toEqual(["text", "image"]);
    expect(config.models[0].cost).toEqual({
      input: 10,
      output: 30,
      cacheRead: 5,
      cacheWrite: 15,
    });
  });

  it("should not mutate input models when building config", () => {
    const models = [...sampleModels];
    const originalCost = { ...models[0].cost };

    buildProviderConfig(
      "https://polza.ai/api/v1",
      "POLZA_AI_API_KEY",
      models
    );

    expect(models[0].cost).toEqual(originalCost);
  });
});
