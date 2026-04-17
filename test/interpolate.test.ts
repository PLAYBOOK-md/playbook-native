import { describe, it, expect } from 'vitest';
import { interpolate } from '../src/interpolate';

describe('interpolate', () => {
  it('substitutes {{var}} from inputs', () => {
    expect(interpolate('Hello {{name}}!', { inputs: { name: 'World' }, namedOutputs: {} }))
      .toBe('Hello World!');
  });

  it('substitutes from named outputs', () => {
    expect(interpolate('Type: {{kind}}', { inputs: {}, namedOutputs: { kind: 'bug' } }))
      .toBe('Type: bug');
  });

  it('inputs take precedence over named outputs on collision', () => {
    expect(
      interpolate('{{x}}', { inputs: { x: 'from-inputs' }, namedOutputs: { x: 'from-outputs' } }),
    ).toBe('from-inputs');
  });

  it('leaves unknown variables as literal text', () => {
    expect(interpolate('Missing: {{nope}}', { inputs: {}, namedOutputs: {} }))
      .toBe('Missing: {{nope}}');
  });

  it('handles multiple substitutions in one string', () => {
    expect(
      interpolate('{{a}} and {{b}}', { inputs: { a: 'one', b: 'two' }, namedOutputs: {} }),
    ).toBe('one and two');
  });
});
