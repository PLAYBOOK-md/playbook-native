import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { parsePlaybook } from '@playbook-md/core';
import { runPlaybook } from '../src/loop';

const GATE = process.env.RUN_GOLDEN === '1';
const describeIfGated = GATE ? describe : describe.skip;

describeIfGated('integration (real API)', () => {
  it('executes the linear fixture end-to-end against the real model', async () => {
    const md = fs.readFileSync(path.join(__dirname, 'fixtures/linear.playbook.md'), 'utf-8');
    const parsed = parsePlaybook(md);

    const result = await runPlaybook({
      definition: parsed.definition!,
      inputs: { topic: 'prompt caching' },
      elicitOverrides: {},
      model: 'claude-opus-4-7',
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });

    expect(result.status).toBe('ok');
    expect(result.stepCount).toBe(2);
    expect(result.finalOutput.length).toBeGreaterThan(50);
  }, 120_000);
});
