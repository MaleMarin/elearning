/**
 * Configuración central de modelos multi-LLM (Vercel AI SDK).
 * Solo se exponen proveedores con API key configurada.
 */

import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

export type LLMProvider = "anthropic" | "openai" | "google";

const HAS_ANTHROPIC = Boolean(
  typeof process !== "undefined" && process.env?.ANTHROPIC_API_KEY?.trim()
);
const HAS_OPENAI = Boolean(
  typeof process !== "undefined" && process.env?.OPENAI_API_KEY?.trim()
);
const HAS_GOOGLE = Boolean(
  typeof process !== "undefined" && process.env?.GOOGLE_GENERATIVE_AI_API_KEY?.trim()
);

export const models: Partial<Record<LLMProvider, LanguageModel>> = {
  ...(HAS_ANTHROPIC && { anthropic: anthropic("claude-sonnet-4-5") }),
  ...(HAS_OPENAI && { openai: openai("gpt-4o") }),
  ...(HAS_GOOGLE && { google: google("gemini-2.0-flash") }),
};

export const DEFAULT_PROVIDER: LLMProvider = "anthropic";
export const FALLBACK_PROVIDER: LLMProvider = "openai";

const FALLBACK_ORDER: LLMProvider[] = ["anthropic", "openai", "google"];

/** Lista de proveedores con key configurada (para el selector en UI). */
export function getAvailableProviders(): LLMProvider[] {
  return FALLBACK_ORDER.filter((p) => models[p]);
}

/** Etiqueta para mostrar en UI. */
export function getProviderLabel(provider: LLMProvider): string {
  const labels: Record<LLMProvider, string> = {
    anthropic: "Claude (Anthropic)",
    openai: "GPT-4o (OpenAI)",
    google: "Gemini Flash (Google)",
  };
  return labels[provider] ?? provider;
}

/** Nombre corto del modelo para "Respondiendo con [nombre]". */
export function getModelDisplayName(provider: LLMProvider): string {
  const names: Record<LLMProvider, string> = {
    anthropic: "Claude",
    openai: "GPT-4o",
    google: "Gemini Flash",
  };
  return names[provider] ?? provider;
}

export function getModel(provider: LLMProvider): LanguageModel {
  const model = models[provider];
  if (model) return model;
  const fallback = FALLBACK_ORDER.find((p) => models[p]);
  if (fallback) return models[fallback]!;
  throw new Error("Ningún proveedor LLM configurado (configura al menos una API key).");
}

/** Intenta con el proveedor elegido; si falla, prueba los siguientes en orden. */
export async function getModelWithFallback(
  preferred: LLMProvider
): Promise<{ model: LanguageModel; provider: LLMProvider }> {
  const startIndex = FALLBACK_ORDER.indexOf(preferred);
  const toTry = [
    ...FALLBACK_ORDER.slice(startIndex >= 0 ? startIndex : 0),
    ...FALLBACK_ORDER.slice(0, startIndex >= 0 ? startIndex : 0),
  ].filter((p) => models[p]);

  for (const provider of toTry) {
    const model = models[provider];
    if (model) return { model, provider };
  }
  throw new Error("Ningún proveedor LLM configurado.");
}
