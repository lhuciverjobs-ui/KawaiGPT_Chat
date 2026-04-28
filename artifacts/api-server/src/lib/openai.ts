import OpenAI from "openai";

export interface OpenAIConfig {
  baseURL: string;
  apiKey: string;
}

export function getOpenRouterHeaders(baseURL: string): Record<string, string> {
  if (!baseURL.toLowerCase().includes("openrouter.ai")) {
    return {};
  }

  return {
    "HTTP-Referer": process.env["OPENROUTER_HTTP_REFERER"] ?? "http://localhost:5173",
    "X-Title": process.env["OPENROUTER_X_TITLE"] ?? "Kawaii Chat",
  };
}

export function getOpenAIConfig(): OpenAIConfig | null {
  const baseURL =
    process.env["OPENAI_BASE_URL"] ??
    process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"];
  const apiKey =
    process.env["OPENAI_API_KEY"] ??
    process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];

  if (!baseURL || !apiKey) {
    return null;
  }

  return { baseURL, apiKey };
}

export function requireOpenAIConfig(): OpenAIConfig {
  const config = getOpenAIConfig();
  if (!config) {
    throw new Error(
      "Missing OpenAI configuration. Set OPENAI_BASE_URL and OPENAI_API_KEY.",
    );
  }
  return config;
}

export function createOpenAIClient(): OpenAI {
  const config = requireOpenAIConfig();
  return new OpenAI({
    baseURL: config.baseURL,
    apiKey: config.apiKey,
    defaultHeaders: getOpenRouterHeaders(config.baseURL),
  });
}
