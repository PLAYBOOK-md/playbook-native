import Anthropic from '@anthropic-ai/sdk';
import type { TextBlock } from '@anthropic-ai/sdk/resources/messages';

export interface ModelCallResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
}

export async function callModel(args: {
  apiKey: string;
  model: string;
  system?: string;
  priorOutputs: string[];
  stepPrompt: string;
}): Promise<ModelCallResult> {
  const client = new Anthropic({ apiKey: args.apiKey });

  const userContent = [
    ...args.priorOutputs.map((o, i) => `[Output of step ${i + 1}]\n${o}`),
    args.stepPrompt,
  ].join('\n\n');

  const message = await client.messages.create({
    model: args.model,
    max_tokens: 4096,
    system: args.system,
    messages: [{ role: 'user', content: userContent }],
  });

  const textBlocks = message.content.filter((b): b is TextBlock => b.type === 'text');
  const text = textBlocks.map((b) => b.text).join('\n');

  return {
    text,
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
  };
}
