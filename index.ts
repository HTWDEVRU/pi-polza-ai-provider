/**
 * Polza.AI Provider for pi-coding-agent
 *
 * Загружает модели из Polza.AI и регистрирует их как провайдер.
 * Модели появляются только когда установлен POLZA_AI_API_KEY.
 * Без ключа провайдер не отображается в /model.
 *
 * Usage:
 *   pi -e ./pi-polza-ai-provider
 *   Set POLZA_AI_API_KEY before starting pi
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { PolzaModelsClient } from "./src/api-client";
import { buildProviderConfig } from "./src/provider-builder";
import { ENV_KEY_NAME } from "./src/config";

export default async function (pi: ExtensionAPI) {
  const apiKey = process.env[ENV_KEY_NAME];
  if (!apiKey) {
    return;
  }

  // notify callback: uses console since ExtensionAPI has no `ui` at init time.
  // When called from a command handler, replace with ctx.ui.notify instead.
  const client = new PolzaModelsClient(apiKey, undefined, (msg, type) => {
    if (type === "error") {
      console.error("[pi-polza-ai-provider]", msg);
    } else {
      console.warn("[pi-polza-ai-provider]", msg);
    }
  });

  const models = await client.fetchChatModels();

  if (models.length > 0) {
    pi.registerProvider("polza-ai", buildProviderConfig(undefined, ENV_KEY_NAME, models));
  }
}
