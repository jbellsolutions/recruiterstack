import Anthropic from "@anthropic-ai/sdk";

const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-20250514";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_OPENROUTER_MODEL = "anthropic/claude-sonnet-4";

interface AIClientConfig {
  provider: "anthropic" | "openrouter";
  model?: string;
}

// Both Anthropic and OpenRouter use the same Messages API format.
// The Anthropic SDK can point to OpenRouter by changing the base URL.
export function createAIClient(config: AIClientConfig): Anthropic {
  if (config.provider === "openrouter") {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");
    return new Anthropic({
      apiKey,
      baseURL: OPENROUTER_BASE_URL,
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");
  return new Anthropic({ apiKey });
}

export function getModel(config: AIClientConfig): string {
  if (config.model) return config.model;
  return config.provider === "openrouter" ? DEFAULT_OPENROUTER_MODEL : DEFAULT_ANTHROPIC_MODEL;
}
