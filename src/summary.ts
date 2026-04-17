export interface StepSummary {
  number: number;
  title: string;
  status: 'executed' | 'skipped';
  inputTokens?: number;
  outputTokens?: number;
}

export function renderSummary(args: {
  steps: StepSummary[];
  artifactPath: string;
  warnings: string[];
}): string {
  const lines: string[] = [];
  lines.push('## PLAYBOOK.md Execution Summary');
  lines.push('');
  lines.push(`**Artifact:** \`${args.artifactPath}\``);
  lines.push('');
  lines.push('| # | Title | Status | Input tokens | Output tokens |');
  lines.push('|---|-------|--------|--------------|---------------|');
  for (const s of args.steps) {
    lines.push(
      `| ${s.number} | ${s.title} | ${s.status} | ${s.inputTokens ?? '-'} | ${s.outputTokens ?? '-'} |`,
    );
  }
  if (args.warnings.length > 0) {
    lines.push('');
    lines.push('### Warnings');
    for (const w of args.warnings) lines.push(`- ${w}`);
  }
  lines.push('');
  return lines.join('\n');
}
