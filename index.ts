/**
 * Polza.AI Provider for pi-coding-agent
 *
 * Загружает модели из Polza.AI и регистрирует их как провайдер.
 * Модели появляются только когда установлен POLZA_AI_API_KEY.
 * Без ключа провайдер не отображается в /model.
 *
 * Подписывается на события model_select, resources_discover, session_start,
 * tool_execution_end, agent_end — при появлении POLZA_AI_API_KEY
 * провайдер регистрируется (или перерегистрируется).
 *
 * Usage:
 *   pi -e ./pi-polza-ai-provider
 *   Set POLZA_AI_API_KEY before starting pi, or set it at runtime
 *   (e.g. via /term or another extension) and the provider will appear
 *   on the next event.
 */

import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { PolzaModelsClient } from "./src/api-client";
import { buildProviderConfig } from "./src/provider-builder";
import { ENV_KEY_NAME } from "./src/config";

export default async function (pi: ExtensionAPI) {
  let registered = false;

  // ── пытаемся зарегистрировать провайдер (при наличии ключа) ──
  async function tryRegister(ctx?: ExtensionContext) {
    const apiKey = process.env[ENV_KEY_NAME];

    if (!apiKey) {
      return;
    }

    if (registered) {
      return;
    }

    const notify = ctx
      ? (msg: string, type?: "info" | "warning" | "error") => ctx.ui.notify(msg, type)
      : undefined;

    const client = new PolzaModelsClient(apiKey, undefined, notify);
    const models = await client.fetchChatModels();

    if (models.length > 0) {
      pi.registerProvider("polza-ai", buildProviderConfig(undefined, ENV_KEY_NAME, models));
      registered = true;
    }
  }

  // ── первичная попытка (при старте расширения, ctx ещё нет) ──
  await tryRegister();

  // ── подписки на события: перепроверяем при каждом ──
  pi.on("model_select", async (_event, ctx) => {
    await tryRegister(ctx);
  });

  pi.on("resources_discover", async (_event, ctx) => {
    await tryRegister(ctx);
  });

  pi.on("session_start", async (_event, ctx) => {
    await tryRegister(ctx);
  });

  pi.on("tool_execution_end", async (_event, ctx) => {
    await tryRegister(ctx);
  });

  pi.on("agent_end", async (_event, ctx) => {
    await tryRegister(ctx);
  });
}
