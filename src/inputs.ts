import YAML from 'yaml';

export interface ParsedActionInputs {
  inputs: Record<string, string>;
  elicit: Record<number, string>;
}

export function parseActionInputs(args: {
  inputsYaml: string;
  elicitYaml: string;
}): ParsedActionInputs {
  return {
    inputs: parseStringMap(args.inputsYaml, 'inputs'),
    elicit: parseElicitMap(args.elicitYaml),
  };
}

function parseStringMap(yamlText: string, label: string): Record<string, string> {
  if (!yamlText.trim()) return {};
  let parsed: unknown;
  try {
    parsed = YAML.parse(yamlText);
  } catch (err) {
    throw new Error(`Invalid YAML in \`${label}\` block: ${(err as Error).message}`);
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`\`${label}\` must be a YAML mapping, got: ${typeof parsed}`);
  }
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    result[key] = String(value);
  }
  return result;
}

function parseElicitMap(yamlText: string): Record<number, string> {
  if (!yamlText.trim()) return {};
  let parsed: unknown;
  try {
    parsed = YAML.parse(yamlText);
  } catch (err) {
    throw new Error(`Invalid YAML in \`elicit\` block: ${(err as Error).message}`);
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('`elicit` must be a YAML mapping of step numbers to responses');
  }
  const result: Record<number, string> = {};
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    const stepNum = Number(key);
    if (!Number.isInteger(stepNum) || stepNum < 1) {
      throw new Error(`\`elicit\` keys must be positive step numbers, got: "${key}"`);
    }
    result[stepNum] = String(value);
  }
  return result;
}
