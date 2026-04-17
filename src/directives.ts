import type { ElicitationDef, Step } from '@playbook-md/core';

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

export interface CaptureResult {
  value: string;
  warning?: string;
}

const RE_JSON_BLOCK = /```json\s*\n([\s\S]+?)\n```/g;
const RE_JSON_BARE = /\{[\s\S]*?\}/g;

export function captureOutput(args: { response: string; step: Step }): CaptureResult {
  const step = args.step;
  const raw = args.response;

  if (step.extract_field) {
    const extracted = extractField(raw, step.extract_field);
    if (extracted !== null) {
      return enforceEnum(extracted, step);
    }
    return {
      value: raw,
      warning: `Step ${step.number} @output(extract:"${step.extract_field}") failed — no JSON with that field found; falling back to full response.`,
    };
  }

  return enforceEnum(raw, step);
}

function enforceEnum(value: string, step: Step): CaptureResult {
  if (step.output_type === 'enum' && step.output_options) {
    if (!step.output_options.includes(value.trim())) {
      return {
        value,
        warning: `Step ${step.number} @output is enum but response "${value.trim()}" is not one of the declared enum options: ${step.output_options.join(', ')}`,
      };
    }
    return { value: value.trim() };
  }
  return { value };
}

function extractField(text: string, field: string): string | null {
  const candidates: string[] = [];
  for (const match of text.matchAll(RE_JSON_BLOCK)) candidates.push(match[1]);
  for (const match of text.matchAll(RE_JSON_BARE)) candidates.push(match[0]);
  for (let i = candidates.length - 1; i >= 0; i--) {
    try {
      const obj = JSON.parse(candidates[i]);
      if (obj && typeof obj === 'object' && field in obj) {
        return String((obj as Record<string, unknown>)[field]);
      }
    } catch {
      // try next candidate
    }
  }
  return null;
}
