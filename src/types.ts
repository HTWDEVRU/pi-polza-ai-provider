/**
 * Type definitions for Polza.AI provider
 */

/**
 * Full model configuration fetched from Polza.AI API.
 */
export interface ApiModelConfig {
  id: string;
  name: string;
  reasoning: boolean;
  input: ("text" | "image")[];
  cost: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
  };
  contextWindow: number;
  maxTokens: number;
}
