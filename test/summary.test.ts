import { describe, it, expect } from 'vitest';
import { renderSummary } from '../src/summary';

describe('renderSummary', () => {
  it('renders a table of executed steps with status + token counts', () => {
    const md = renderSummary({
      steps: [
        { number: 1, title: 'Research', status: 'executed', inputTokens: 100, outputTokens: 200 },
        { number: 2, title: 'Write', status: 'executed', inputTokens: 150, outputTokens: 500 },
        { number: 3, title: 'Maybe', status: 'skipped' },
      ],
      artifactPath: 'out/123.md',
      warnings: [],
    });
    expect(md).toContain('| 1 | Research |');
    expect(md).toContain('executed');
    expect(md).toContain('skipped');
    expect(md).toContain('out/123.md');
  });

  it('lists warnings when present', () => {
    const md = renderSummary({
      steps: [],
      artifactPath: 'out/x.md',
      warnings: ['step 2: extract failed'],
    });
    expect(md).toContain('step 2: extract failed');
  });
});
