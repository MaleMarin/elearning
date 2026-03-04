/**
 * Provider-agnostic LLM client.
 * Uses MODEL_API_KEY for real API; falls back to mock if not set.
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ModelClientOptions {
  apiKey?: string;
  baseURL?: string;
  model?: string;
}

export interface ModelResponse {
  content: string;
  finishReason?: string;
}

const MOCK_RESPONSES: Record<string, string> = {
  tutor: "Soy el tutor del curso (modo mock). En producción usarías el contexto de la lección para responder. ¿Quieres un mini-quiz?",
  support: "Soy el asistente de soporte (modo mock). Revisa el FAQ o te puedo abrir un ticket si no encuentras solución.",
  community: "Soy el asistente de comunidad (modo mock). Puedo ayudar con moderación y dinamización.",
};

/**
 * Generic client that calls an OpenAI-compatible API (OpenAI, Azure, local, etc.)
 * with MODEL_API_KEY. If not set, returns mock responses.
 */
export async function chat(
  messages: ChatMessage[],
  options: ModelClientOptions = {}
): Promise<ModelResponse> {
  const apiKey = options.apiKey ?? process.env.MODEL_API_KEY;
  const baseURL = options.baseURL ?? process.env.MODEL_API_BASE_URL;
  const model = options.model ?? process.env.MODEL_NAME ?? "gpt-4o-mini";

  if (!apiKey) {
    const lastUser = messages.filter((m) => m.role === "user").pop();
    const mode = (lastUser?.content?.includes("tutor") && "tutor") ||
      (lastUser?.content?.includes("soporte") && "support") || "community";
    return {
      content: MOCK_RESPONSES[mode] ?? MOCK_RESPONSES.community,
      finishReason: "mock",
    };
  }

  const url = baseURL
    ? `${baseURL.replace(/\/$/, "")}/chat/completions`
    : "https://api.openai.com/v1/chat/completions";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Model API error ${res.status}: ${err}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
  };
  const choice = data.choices?.[0];
  const content = choice?.message?.content ?? "";
  const finishReason = choice?.finish_reason;

  return { content, finishReason };
}
