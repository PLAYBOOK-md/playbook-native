import { describe, it, expect } from 'vitest';
import { parseActionInputs } from '../src/inputs';

describe('parseActionInputs', () => {
  it('returns empty records when both inputs and elicit blocks are empty', () => {
    const result = parseActionInputs({ inputsYaml: '', elicitYaml: '' });
    expect(result.inputs).toEqual({});
    expect(result.elicit).toEqual({});
  });

  it('parses a YAML inputs block into a flat string map', () => {
    const result = parseActionInputs({
      inputsYaml: 'topic: "AI safety"\naudience: maintainer\nword_count: 1500',
      elicitYaml: '',
    });
    expect(result.inputs).toEqual({
      topic: 'AI safety',
      audience: 'maintainer',
      word_count: '1500',
    });
  });

  it('parses an elicit block into a step-number → string map', () => {
    const result = parseActionInputs({
      inputsYaml: '',
      elicitYaml: '3: "no"\n4: Performance',
    });
    expect(result.elicit).toEqual({ 3: 'no', 4: 'Performance' });
  });

  it('throws a clear error on invalid YAML', () => {
    expect(() =>
      parseActionInputs({ inputsYaml: ': :::', elicitYaml: '' }),
    ).toThrow(/invalid YAML in `inputs` block/i);
  });
});
