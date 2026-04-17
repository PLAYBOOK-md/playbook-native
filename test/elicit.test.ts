import { describe, it, expect } from 'vitest';
import { resolveElicit } from '../src/directives';

describe('resolveElicit', () => {
  it('confirm defaults to "yes"', () => {
    expect(
      resolveElicit({ type: 'confirm', prompt: 'Proceed?' }, { stepNumber: 2, overrides: {} }),
    ).toBe('yes');
  });

  it('select defaults to first option', () => {
    expect(
      resolveElicit(
        { type: 'select', prompt: 'Pick:', options: ['A', 'B', 'C'] },
        { stepNumber: 2, overrides: {} },
      ),
    ).toBe('A');
  });

  it('input defaults to empty string', () => {
    expect(
      resolveElicit({ type: 'input', prompt: 'Notes?' }, { stepNumber: 2, overrides: {} }),
    ).toBe('');
  });

  it('overrides take precedence when present for the step', () => {
    expect(
      resolveElicit(
        { type: 'confirm', prompt: 'Proceed?' },
        { stepNumber: 3, overrides: { 3: 'no' } },
      ),
    ).toBe('no');
  });

  it('throws when a select override is not one of the options', () => {
    expect(() =>
      resolveElicit(
        { type: 'select', prompt: 'Pick:', options: ['A', 'B'] },
        { stepNumber: 3, overrides: { 3: 'C' } },
      ),
    ).toThrow(/not one of the declared options/);
  });
});
