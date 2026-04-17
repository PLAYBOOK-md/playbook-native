import type { Step, PlaybookDefinition } from '@playbook-md/core';
import { createContext, type ExecutionContext } from './context';
import { interpolate } from './interpolate';
import { selectBranch } from './branching';
import { resolveElicit, captureOutput, resolvePromptRef } from './directives';
import { callModel } from './anthropic';

export interface RunResult {
  status: 'ok' | 'failed' | 'skipped';
  stepCount: number;
  finalOutput: string;
  warnings: string[];
}

export async function runPlaybook(args: {
  definition: PlaybookDefinition;
  inputs: Record<string, string>;
  elicitOverrides: Record<number, string>;
  model: string;
  apiKey: string;
}): Promise<RunResult> {
  const ctx = createContext(args);
  let finalOutput = '';
  let stepsRun = 0;

  for (const step of ctx.definition.steps) {
    const result = await runStep(step, ctx);
    if (result.status === 'executed') {
      stepsRun++;
      finalOutput = result.output;
    }
  }

  return {
    status: 'ok',
    stepCount: stepsRun,
    finalOutput,
    warnings: ctx.warnings,
  };
}

type StepResult =
  | { status: 'executed'; output: string }
  | { status: 'skipped' };

async function runStep(step: Step, ctx: ExecutionContext): Promise<StepResult> {
  if (step.is_branching && step.branches) {
    const picked = selectBranch(step.branches, { inputs: ctx.inputs, namedOutputs: ctx.namedOutputs });
    if (!picked) return { status: 'skipped' };
    let last = '';
    for (const sub of picked.steps) {
      const r = await runStep(sub, ctx);
      if (r.status === 'executed') last = r.output;
    }
    return last ? { status: 'executed', output: last } : { status: 'skipped' };
  }

  const isElicitOnly = !!step.elicitation && !step.content.trim() && !step.prompt_ref;
  let stepOutput: string;

  if (isElicitOnly && step.elicitation) {
    stepOutput = resolveElicit(step.elicitation, {
      stepNumber: step.number,
      overrides: ctx.elicitOverrides,
    });
  } else {
    const scope = { inputs: ctx.inputs, namedOutputs: ctx.namedOutputs };
    let prompt = interpolate(step.content, scope);

    if (step.elicitation) {
      const response = resolveElicit(step.elicitation, {
        stepNumber: step.number,
        overrides: ctx.elicitOverrides,
      });
      prompt = `[User response: ${response}]\n\n${prompt}`;
    }

    const extraPrompt = resolvePromptRef(step.prompt_ref);
    if (extraPrompt) prompt = `${interpolate(extraPrompt, scope)}\n\n${prompt}`;

    const call = await callModel({
      apiKey: ctx.apiKey,
      model: ctx.model,
      system: ctx.definition.system_prompt,
      priorOutputs: ctx.priorOutputs,
      stepPrompt: prompt,
    });
    stepOutput = call.text;
  }

  if (step.output_var) {
    const capture = captureOutput({ response: stepOutput, step });
    if (capture.warning) ctx.warnings.push(capture.warning);
    ctx.namedOutputs[step.output_var] = capture.value;
  }

  ctx.priorOutputs.push(stepOutput);
  return { status: 'executed', output: stepOutput };
}
