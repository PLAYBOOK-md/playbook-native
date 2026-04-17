import { describe, it, expect, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { parsePlaybook } from '@playbook-md/core';
import { runPlaybook } from '../src/loop';

vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    messages = {
      create: vi.fn(async (params: any) => ({
        content: [{ type: 'text', text: `response to: ${params.messages[0].content.slice(0, 50)}` }],
        stop_reason: 'end_turn',
        usage: { input_tokens: 1, output_tokens: 1 },
      })),
    };
  },
}));

const FIXTURES = path.join(__dirname, 'fixtures');

function loadPlaybook(name: string) {
  const md = fs.readFileSync(path.join(FIXTURES, name), 'utf-8');
  const parsed = parsePlaybook(md);
  return parsed.definition!;
}

describe('runPlaybook', () => {
  it('executes a linear playbook and returns the final step output', async () => {
    const result = await runPlaybook({
      definition: loadPlaybook('linear.playbook.md'),
      inputs: { topic: 'quantum' },
      elicitOverrides: {},
      model: 'claude-opus-4-7',
      apiKey: 'sk-ant-test',
    });
    expect(result.status).toBe('ok');
    expect(result.stepCount).toBe(2);
    expect(result.finalOutput).toContain('response to');
  });

  it('applies autonomous-mode defaults for @elicit', async () => {
    const result = await runPlaybook({
      definition: loadPlaybook('elicit-autonomous.playbook.md'),
      inputs: {},
      elicitOverrides: {},
      model: 'claude-opus-4-7',
      apiKey: 'sk-ant-test',
    });
    expect(result.status).toBe('ok');
  });

  it('selects the correct branch based on a named output', async () => {
    const result = await runPlaybook({
      definition: loadPlaybook('branching.playbook.md'),
      inputs: { kind: 'bug' },
      elicitOverrides: {},
      model: 'claude-opus-4-7',
      apiKey: 'sk-ant-test',
    });
    expect(result.status).toBe('ok');
  });
});
