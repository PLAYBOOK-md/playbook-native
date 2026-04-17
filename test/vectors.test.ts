import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { parsePlaybook } from '@playbook-md/core';
import { parseActionInputs } from '../src/inputs';
import { runPlaybook } from '../src/loop';

const VECTORS_DIR = path.join(__dirname, 'vectors');
const GATE = process.env.RUN_VECTORS === '1';
const describeIfGated = GATE ? describe : describe.skip;

describeIfGated('parity vectors', () => {
  const entries = fs.readdirSync(VECTORS_DIR).filter((e) =>
    fs.statSync(path.join(VECTORS_DIR, e)).isDirectory(),
  );
  for (const entry of entries) {
    it(`vector: ${entry}`, async () => {
      const dir = path.join(VECTORS_DIR, entry);
      const md = fs.readFileSync(path.join(dir, 'playbook.playbook.md'), 'utf-8');
      const inputsYaml = fs.readFileSync(path.join(dir, 'inputs.yaml'), 'utf-8');
      const expected = fs.readFileSync(path.join(dir, 'expected-output.md'), 'utf-8').trim();

      const parsed = parsePlaybook(md);
      const { inputs, elicit } = parseActionInputs({ inputsYaml, elicitYaml: '' });

      const result = await runPlaybook({
        definition: parsed.definition!,
        inputs,
        elicitOverrides: elicit,
        model: 'claude-opus-4-7',
        apiKey: process.env.ANTHROPIC_API_KEY!,
      });

      expect(result.finalOutput).toContain(expected);
    }, 120_000);
  }
});
