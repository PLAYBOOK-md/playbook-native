import type { PlaybookDefinition } from '@playbook-md/core';

export interface ExecutionContext {
  definition: PlaybookDefinition;
  inputs: Record<string, string>;
  elicitOverrides: Record<number, string>;
  priorOutputs: string[];
  namedOutputs: Record<string, string>;
  warnings: string[];
  model: string;
  apiKey: string;
}

export function createContext(args: {
  definition: PlaybookDefinition;
  inputs: Record<string, string>;
  elicitOverrides: Record<number, string>;
  model: string;
  apiKey: string;
}): ExecutionContext {
  return {
    definition: args.definition,
    inputs: args.inputs,
    elicitOverrides: args.elicitOverrides,
    priorOutputs: [],
    namedOutputs: {},
    warnings: [],
    model: args.model,
    apiKey: args.apiKey,
  };
}
