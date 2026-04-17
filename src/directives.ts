import type { ElicitationDef } from '@playbook-md/core';

export function resolveElicit(
  elicit: ElicitationDef,
  ctx: { stepNumber: number; overrides: Record<number, string> },
): string {
  const override = ctx.overrides[ctx.stepNumber];
  if (override !== undefined) {
    if (elicit.type === 'select' && elicit.options && !elicit.options.includes(override)) {
      throw new Error(
        `Step ${ctx.stepNumber} @elicit override "${override}" is not one of the declared options: ${elicit.options.join(', ')}`,
      );
    }
    return override;
  }
  switch (elicit.type) {
    case 'confirm':
      return 'yes';
    case 'select':
      return elicit.options?.[0] ?? '';
    case 'input':
      return '';
  }
}
