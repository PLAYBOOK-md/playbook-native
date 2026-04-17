export interface InterpolationScope {
  inputs: Record<string, string>;
  namedOutputs: Record<string, string>;
}

const RE_VAR = /\{\{(\w+)\}\}/g;

export function interpolate(text: string, scope: InterpolationScope): string {
  return text.replace(RE_VAR, (match, name) => {
    if (name in scope.inputs) return scope.inputs[name];
    if (name in scope.namedOutputs) return scope.namedOutputs[name];
    return match;
  });
}
