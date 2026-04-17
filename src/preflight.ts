import * as fs from 'fs';
import { parsePlaybook, validatePlaybook } from '@playbook-md/core';
import type { PlaybookDefinition, Step } from '@playbook-md/core';

export interface PreflightResult {
  ok: boolean;
  error?: string;
  playbook?: PlaybookDefinition;
  warnings: string[];
}

export function runPreflight(args: {
  apiKey: string;
  playbookPath: string;
  strict: boolean;
}): PreflightResult {
  const warnings: string[] = [];

  if (!args.apiKey) {
    return {
      ok: false,
      error:
        'ANTHROPIC_API_KEY is not set. ' +
        'Set it as a repo secret and pass via `env: { ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }} }`. ' +
        'See https://docs.playbook.style/guides/github-actions/#authentication',
      warnings,
    };
  }

  if (!fs.existsSync(args.playbookPath)) {
    return {
      ok: false,
      error: `Playbook file not found: ${args.playbookPath}`,
      warnings,
    };
  }

  const markdown = fs.readFileSync(args.playbookPath, 'utf-8');

  const validation = validatePlaybook(markdown);
  if (!validation.valid) {
    const fatal = validation.fatal_errors.map((e) => e.message).join('; ');
    return {
      ok: false,
      error: `Playbook failed validation: ${fatal}`,
      warnings,
    };
  }
  for (const w of validation.warnings) warnings.push(w.message);
  if (args.strict && warnings.length > 0) {
    return {
      ok: false,
      error: `Strict mode: ${warnings.length} warning(s) found`,
      warnings,
    };
  }

  const parsed = parsePlaybook(markdown);
  if (!parsed.definition) {
    return { ok: false, error: 'Playbook parse returned no definition', warnings };
  }

  const mcpError = rejectMcpDirectives(parsed.definition.steps);
  if (mcpError) {
    return { ok: false, error: mcpError, warnings };
  }

  return { ok: true, playbook: parsed.definition, warnings };
}

function rejectMcpDirectives(steps: Step[]): string | null {
  for (const step of steps) {
    if (step.tool_call?.connection_name) {
      return (
        `Step ${step.number} uses @tool(${step.tool_call.connection_name}/${step.tool_call.tool_name}) ` +
        `which requires MCP support. playbook-native does not support MCP directives in v1. ` +
        `Switch to PLAYBOOK-MD/playbook-run@v1 (composite), which has full MCP support via claude-code-action.`
      );
    }
    if (step.prompt_ref?.prompt_id?.startsWith('mcp:')) {
      return (
        `Step ${step.number} uses @prompt(${step.prompt_ref.prompt_id}). ` +
        `playbook-native does not support MCP-sourced prompts in v1. ` +
        `Switch to PLAYBOOK-MD/playbook-run@v1 (composite).`
      );
    }
    if (step.prompt_ref?.prompt_id?.startsWith('library:')) {
      return (
        `Step ${step.number} uses @prompt(${step.prompt_ref.prompt_id}). ` +
        `playbook-native does not support prompt libraries in v1 (requires MCP). ` +
        `Switch to PLAYBOOK-MD/playbook-run@v1 (composite).`
      );
    }
    if (step.branches) {
      for (const b of step.branches) {
        const nested = rejectMcpDirectives(b.steps);
        if (nested) return nested;
      }
    }
  }
  return null;
}
