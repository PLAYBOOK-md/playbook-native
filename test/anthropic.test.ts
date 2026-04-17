import { describe, it, expect, vi, beforeEach } from 'vitest';
import { callModel } from '../src/anthropic';

// Mock the SDK at the module level — intercept client.messages.create.
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages = {
        create: vi.fn(async (_params: any) => ({
          content: [{ type: 'text', text: 'mock response' }],
          stop_reason: 'end_turn',
          usage: { input_tokens: 10, output_tokens: 5 },
        })),
      };
    },
  };
});

describe('callModel', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the response text from Claude', async () => {
    const result = await callModel({
      apiKey: 'sk-ant-test',
      model: 'claude-opus-4-7',
      system: 'You are helpful.',
      priorOutputs: ['first step output'],
      stepPrompt: 'Summarize.',
    });
    expect(result.text).toBe('mock response');
    expect(result.inputTokens).toBe(10);
    expect(result.outputTokens).toBe(5);
  });
});
