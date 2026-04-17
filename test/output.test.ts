import { describe, it, expect } from 'vitest';
import { captureOutput } from '../src/directives';

describe('captureOutput', () => {
  it('basic: stores the full response as the named output', () => {
    const result = captureOutput({
      response: 'Hello world',
      step: { number: 1, output_var: 'greeting' } as any,
    });
    expect(result.value).toBe('Hello world');
    expect(result.warning).toBeUndefined();
  });

  it('extract: pulls a named field from the last JSON object in the response', () => {
    const response = 'Analysis:\n```json\n{"kind": "bug", "severity": "high"}\n```';
    const result = captureOutput({
      response,
      step: { number: 1, output_var: 'kind', extract_field: 'kind' } as any,
    });
    expect(result.value).toBe('bug');
  });

  it('extract: falls back to full response when no JSON is found, with a warning', () => {
    const result = captureOutput({
      response: 'No structured data here',
      step: { number: 1, output_var: 'kind', extract_field: 'kind' } as any,
    });
    expect(result.value).toBe('No structured data here');
    expect(result.warning).toMatch(/extract.*failed/i);
  });

  it('enum: rejects a response not in the options', () => {
    const result = captureOutput({
      response: 'C',
      step: { number: 1, output_var: 'pick', output_type: 'enum', output_options: ['A', 'B'] } as any,
    });
    expect(result.value).toBe('C');
    expect(result.warning).toMatch(/not one of the declared enum options/);
  });
});
