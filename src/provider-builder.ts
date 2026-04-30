/**
 * Build provider config for pi-coding-agent
 *
 * Converts Polza.AI model data into the format expected by pi's registerProvider().
 */

import type { ApiModelConfig } from "./types";
import { POLZA_BASE_URL, ENV_KEY_NAME } from "./config";

/**
 * Build a ProviderConfig for pi's registerProvider API.
 *
 * @param baseUrl   API base URL (defaults to Polza.AI)
 * @param apiKey    Environment variable name pi should use to resolve the key
 * @param models    Array of model configurations from the API client
 */
export function buildProviderConfig(
  baseUrl: string = POLZA_BASE_URL,
  apiKey: string = ENV_KEY_NAME,
  models: ApiModelConfig[]
): {
  baseUrl: string;
  apiKey: string;
  authHeader: boolean;
  api: "openai-completions";
  models: ReturnType<typeof toProviderModel>[];
} {
  return {
    baseUrl,
    apiKey,
    authHeader: true,
    api: "openai-completions" as const,
    models: models.map(toProviderModel),
  };
}

function toProviderModel(model: ApiModelConfig) {
  return {
    id: model.id,
    name: model.name,
    reasoning: model.reasoning,
    input: [...model.input] as ("text" | "image")[],
    cost: { ...model.cost },
    contextWindow: model.contextWindow,
    maxTokens: model.maxTokens,
  };
}
