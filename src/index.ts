import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';
import { parseActionInputs } from './inputs';
import { runPreflight } from './preflight';
import { runPlaybook } from './loop';
import { renderSummary, type StepSummary } from './summary';

async function run(): Promise<void> {
  try {
    const playbookPath = core.getInput('playbook', { required: true });
    const inputsYaml = core.getInput('inputs');
    const elicitYaml = core.getInput('elicit');
    const outputPath = core.getInput('output-path') || `out/${process.env.GITHUB_RUN_ID ?? 'run'}.md`;
    const model = core.getInput('model') || 'claude-opus-4-7';
    const strict = core.getInput('strict') === 'true';

    const apiKey = process.env.ANTHROPIC_API_KEY ?? '';

    const parsed = parseActionInputs({ inputsYaml, elicitYaml });

    const preflight = runPreflight({ apiKey, playbookPath, strict });
    if (!preflight.ok || !preflight.playbook) {
      core.setFailed(preflight.error ?? 'preflight failed');
      return;
    }

    const result = await runPlaybook({
      definition: preflight.playbook,
      inputs: parsed.inputs,
      elicitOverrides: parsed.elicit,
      model,
      apiKey,
    });

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, result.finalOutput, 'utf-8');

    core.setOutput('artifact-path', outputPath);
    core.setOutput('status', result.status);
    core.setOutput('step-count', String(result.stepCount));
    core.setOutput('warnings', String(result.warnings.length));

    const stepSummaries: StepSummary[] = preflight.playbook.steps.map((s) => ({
      number: s.number,
      title: s.title,
      status: 'executed',
    }));
    const md = renderSummary({
      steps: stepSummaries,
      artifactPath: outputPath,
      warnings: [...preflight.warnings, ...result.warnings],
    });
    const summaryFile = process.env.GITHUB_STEP_SUMMARY;
    if (summaryFile) fs.appendFileSync(summaryFile, md + '\n');

    if (result.status !== 'ok') {
      core.setFailed(`playbook-native: status=${result.status}`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    core.setFailed(`playbook-native: ${msg}`);
  }
}

run();
