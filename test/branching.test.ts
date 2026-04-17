import { describe, it, expect } from 'vitest';
import { selectBranch } from '../src/branching';
import type { Branch } from '@playbook-md/core';

const BRANCHES: Branch[] = [
  {
    condition: { variable: 'kind', operator: '==', value: 'bug', source: 'step_output' },
    steps: [{ number: 1, label: '1a', title: 'Bug', content: 'handle bug', is_branching: false }] as any,
  },
  {
    condition: { variable: 'kind', operator: '==', value: 'feature', source: 'step_output' },
    steps: [{ number: 1, label: '1b', title: 'Feature', content: 'handle feature', is_branching: false }] as any,
  },
  {
    condition: null,
    steps: [{ number: 1, label: '1c', title: 'Else', content: 'default', is_branching: false }] as any,
  },
];

describe('selectBranch', () => {
  it('returns the first matching branch on ==', () => {
    const result = selectBranch(BRANCHES, { inputs: {}, namedOutputs: { kind: 'bug' } });
    expect(result?.steps[0].title).toBe('Bug');
  });

  it('respects !=', () => {
    const branches: Branch[] = [
      { condition: { variable: 'kind', operator: '!=', value: 'bug', source: 'step_output' }, steps: BRANCHES[0].steps },
      { condition: null, steps: BRANCHES[2].steps },
    ];
    expect(selectBranch(branches, { inputs: {}, namedOutputs: { kind: 'feature' } })?.steps[0].title).toBe('Bug');
    expect(selectBranch(branches, { inputs: {}, namedOutputs: { kind: 'bug' } })?.steps[0].title).toBe('Else');
  });

  it('returns the else branch when no condition matches', () => {
    const result = selectBranch(BRANCHES, { inputs: {}, namedOutputs: { kind: 'other' } });
    expect(result?.steps[0].title).toBe('Else');
  });

  it('returns null when no condition matches and no else exists', () => {
    const noElse: Branch[] = [BRANCHES[0], BRANCHES[1]];
    expect(selectBranch(noElse, { inputs: {}, namedOutputs: {} })).toBeNull();
  });

  it('treats unknown variable as empty string', () => {
    const branches: Branch[] = [
      { condition: { variable: 'missing', operator: '==', value: '', source: 'step_output' }, steps: BRANCHES[0].steps },
    ];
    expect(selectBranch(branches, { inputs: {}, namedOutputs: {} })?.steps[0].title).toBe('Bug');
  });
});
