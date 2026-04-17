import type { Branch } from '@playbook-md/core';
import type { InterpolationScope } from './interpolate';

export function selectBranch(branches: Branch[], scope: InterpolationScope): Branch | null {
  let elseBranch: Branch | null = null;
  for (const branch of branches) {
    if (branch.condition === null) {
      elseBranch = branch;
      continue;
    }
    const value = resolveVar(branch.condition.variable, scope);
    const matches =
      branch.condition.operator === '=='
        ? value === branch.condition.value
        : value !== branch.condition.value;
    if (matches) return branch;
  }
  return elseBranch;
}

function resolveVar(name: string, scope: InterpolationScope): string {
  if (name in scope.inputs) return scope.inputs[name];
  if (name in scope.namedOutputs) return scope.namedOutputs[name];
  return '';
}
