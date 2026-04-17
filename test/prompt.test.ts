import { describe, it, expect } from 'vitest';
import { resolvePromptRef } from '../src/directives';
import * as path from 'path';

const FIXTURES = path.join(__dirname, 'fixtures');

describe('resolvePromptRef', () => {
  it('reads a file: prompt and returns its contents', () => {
    const result = resolvePromptRef({ prompt_id: `file:${path.join(FIXTURES, 'prompt-snippet.md')}` });
    expect(result).toMatch(/expert technical reviewer/);
  });

  it('returns undefined when no prompt_ref is set', () => {
    expect(resolvePromptRef(undefined)).toBeUndefined();
  });

  it('returns undefined for unsupported schemes with a clear error', () => {
    expect(() => resolvePromptRef({ prompt_id: 'mcp:some/server/prompt' }))
      .toThrow(/MCP-sourced prompts.*not supported/);
  });

  it('errors when file does not exist', () => {
    expect(() => resolvePromptRef({ prompt_id: 'file:./does-not-exist.md' }))
      .toThrow(/not found/);
  });
});
