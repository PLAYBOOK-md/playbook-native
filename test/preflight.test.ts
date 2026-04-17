import { describe, it, expect } from 'vitest';
import { runPreflight } from '../src/preflight';
import * as path from 'path';

const FIXTURES = path.join(__dirname, 'fixtures');

describe('runPreflight', () => {
  it('fails when ANTHROPIC_API_KEY is missing', () => {
    const result = runPreflight({
      apiKey: '',
      playbookPath: path.join(FIXTURES, 'linear.playbook.md'),
      strict: false,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/ANTHROPIC_API_KEY/);
  });

  it('fails with actionable error when playbook file does not exist', () => {
    const result = runPreflight({
      apiKey: 'sk-ant-test',
      playbookPath: path.join(FIXTURES, 'does-not-exist.playbook.md'),
      strict: false,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/not found/i);
  });

  it('fails when playbook uses MCP directives', () => {
    const result = runPreflight({
      apiKey: 'sk-ant-test',
      playbookPath: path.join(FIXTURES, 'mcp-rejected.playbook.md'),
      strict: false,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/MCP/);
    expect(result.error).toMatch(/playbook-run/);
  });

  it('succeeds on a valid MCP-free playbook and returns parsed definition', () => {
    const result = runPreflight({
      apiKey: 'sk-ant-test',
      playbookPath: path.join(FIXTURES, 'linear.playbook.md'),
      strict: false,
    });
    expect(result.ok).toBe(true);
    expect(result.playbook?.title).toBe('Linear Test');
    expect(result.playbook?.steps).toHaveLength(2);
  });
});
