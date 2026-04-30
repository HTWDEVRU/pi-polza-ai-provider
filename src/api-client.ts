/**
 * Fetches chat models from Polza.AI API
 *
 * The API key is accepted directly in the constructor (already resolved from env).
 * This keeps the class testable without touching process.env.
 */

import type { ApiModelConfig } from "./types";
import { POLZA_BASE_URL, REQUEST_TIMEOUT_MS } from "./config";

interface PolzaRawModel {
  id: string;
  name: string;
  type: string;
  top_provider?: {
    context_length: number;
    max_completion_tokens: number;
    pricing?: {
      prompt_per_million: string;
      completion_per_million: string;
    };
  };
}

interface PolzaRawResponse {
  data: PolzaRawModel[];
}

type NotifyFn = (message: string, type?: "info" | "warning" | "error") => void;

export class PolzaModelsClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly notify: NotifyFn | undefined;

  /**
   * @param apiKey  The API key to use. Pass empty string to simulate "no key".
   * @param baseUrl Optional base URL override (defaults to Polza.AI).
   * @param notify  Optional notification callback (e.g. pi.ui.notify) for user-facing messages.
   */
  constructor(apiKey: string, baseUrl: string = POLZA_BASE_URL, notify?: NotifyFn) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.notify = notify;
  }

  async fetchChatModels(): Promise<ApiModelConfig[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const url = `${this.baseUrl.replace(/\/$/, "")}/models?type=chat&include_providers=true`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        this.notify?.(
          `Polza.AI API returned status ${response.status}`,
          "warning"
        );
        return [];
      }

      const data = (await response.json()) as PolzaRawResponse;
      if (!data?.data) {
        return [];
      }

      const chatModels = data.data.filter((model) => model.type === "chat");
      if (chatModels.length === 0) {
        return [];
      }

      return chatModels.map(this.toModelConfig, this);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error";
      this.notify?.(`Failed to fetch Polza.AI models: ${message}`, "error");
      return [];
    }
  }

  private toModelConfig(model: PolzaRawModel): ApiModelConfig {
    const pricing = model.top_provider?.pricing;
    return {
      id: model.id,
      name: model.name,
      reasoning: false,
      input: ["text"],
      cost: {
        input: this.pricingToNumber(pricing?.prompt_per_million),
        output: this.pricingToNumber(pricing?.completion_per_million),
        cacheRead: 0,
        cacheWrite: 0,
      },
      contextWindow: model.top_provider?.context_length ?? 128000,
      maxTokens: model.top_provider?.max_completion_tokens ?? 16384,
    };
  }

  private pricingToNumber(value?: string): number {
    if (value === undefined || value === null) {
      return 0;
    }
    const val = parseFloat(value);
    return Number.isFinite(val) ? val : 0;
  }
}
