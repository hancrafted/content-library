import { describe, expect, it } from 'vitest';
import { formatReport } from './load-format.pure.ts';
import { analyzeLoad, type LoadReport, type SessionLog } from './load.pure.ts';

const WINDOW = { since: new Date('2026-11-15T08:00:00Z'), until: new Date('2026-11-16T08:00:00Z') };

function bash(id: string, timestamp: string, command: string): string {
  return JSON.stringify({
    type: 'assistant',
    timestamp,
    message: { content: [{ type: 'tool_use', id, name: 'Bash', input: { command } }] },
  });
}

function resultLine({
  id,
  timestamp,
  text,
  isError,
}: {
  id: string;
  timestamp: string;
  text: string;
  isError: boolean;
}) {
  return JSON.stringify({
    type: 'user',
    timestamp,
    message: { content: [{ type: 'tool_result', tool_use_id: id, content: text, is_error: isError }] },
  });
}

function failed(id: string, timestamp: string, text: string): string {
  return resultLine({ id, timestamp, text, isError: true });
}

describe('success cases', () => {
  it('prints the report as tables a retro reads in the terminal', () => {
    // ARRANGE
    const logs: SessionLog[] = [
      {
        subagent: true,
        lines: [
          bash('a', '2026-11-15T09:00:00Z', 'git commit -m x'),
          failed(
            'a',
            '2026-11-15T09:01:09Z',
            [
              '✔ typecheck (10.0s)',
              ' FAIL  tests/a.test.ts > walks',
              'Error: Test timed out in 5000ms.',
              'husky - pre-commit script failed (code 1)',
            ].join('\n'),
          ),
        ],
      },
    ];
    const expected = [
      'Load from 2026-11-15T08:00:00.000Z to 2026-11-16T08:00:00.000Z',
      '',
      'Verify steps     runs    p50    p90    max',
      'typecheck           1  10.0s  10.0s  10.0s',
      '',
      'Commands         main  subagent  failed    p50    p90    max',
      'commit              0         1       1  69.0s  69.0s  69.0s',
      'push                0         0       0      -      -      -',
      'verify              0         0       0      -      -      -',
      'verify:quick        0         0       0      -      -      -',
      '',
      'Hook failures',
      'pre-commit          1',
      '',
      'Test timeouts by file',
      'tests/a.test.ts     1',
      '',
      'Peak concurrent logs: 1 (main sessions: 0)',
    ].join('\n');
    // ACT
    const printed = formatReport(analyzeLoad(logs, WINDOW), WINDOW);
    // ASSERT
    expect(printed).toBe(expected);
  });
});

describe('failure cases', () => {
  it('prints none under a table that has no rows', () => {
    // ARRANGE
    const report = analyzeLoad([], WINDOW);
    const noRows = ['Hook failures', 'none', '', 'Test timeouts by file', 'none'].join('\n');
    // ACT
    const printed = formatReport(report, WINDOW);
    // ASSERT
    expect(printed).toContain(noRows);
  });
});

describe('edge cases', () => {
  it('widens the label column to fit a long test file path', () => {
    // ARRANGE
    const file = 'src/episodes/what-lies-below-the-waterline-of-sustainable-ai-skills/robot-story.test.ts';
    const report: LoadReport = { ...analyzeLoad([], WINDOW), timeouts: { [file]: 2, 'tests/a.test.ts': 1 } };
    const rows = [`${file}     2`, `tests/a.test.ts${' '.repeat(file.length - 10)}1`].join('\n');
    // ACT
    const printed = formatReport(report, WINDOW);
    // ASSERT
    expect(printed).toContain(rows);
  });
});
