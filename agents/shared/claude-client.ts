import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

export function getClaudeClient(): Anthropic {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

export async function askClaude(
  prompt: string,
  options: { model?: string; maxTokens?: number; system?: string } = {}
): Promise<string> {
  const claude = getClaudeClient();
  const response = await claude.messages.create({
    model: options.model || 'claude-sonnet-4-20250514',
    max_tokens: options.maxTokens || 4096,
    system: options.system,
    messages: [{ role: 'user', content: prompt }],
  });
  const block = response.content[0];
  return block.type === 'text' ? block.text : '';
}

export async function askClaudeHaiku(prompt: string, system?: string): Promise<string> {
  return askClaude(prompt, { model: 'claude-haiku-4-5-20251001', maxTokens: 2048, system });
}
