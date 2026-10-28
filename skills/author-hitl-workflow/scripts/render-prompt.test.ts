import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';

const SCRIPT = 'skills/author-hitl-workflow/scripts/render-prompt.ts';
const FIXTURE = 'src/explorable-explanations/human-in-the-loop/workflow.fixture.en.yml';
const dir = mkdtempSync(join(tmpdir(), 'render-prompt-'));
/** A pasted value, written to a file the script reads. */
const pasted = (name: string, text: string): string => {
  const path = join(dir, name);
  writeFileSync(path, text);
  return path;
};
/** The script run under plain node, as the skill runs it. */
const render = (...args: string[]) => spawnSync('node', [SCRIPT, FIXTURE, ...args], { encoding: 'utf8' });

afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('success cases', () => {
  it("prints a job's demo prompt with a pasted slot filled", () => {
    // ARRANGE
    const idea = 'A trip to the sea';
    const expected = [
      '## Your role',
      '',
      'You are a patient interviewer.',
      '',
      '## Idea',
      '',
      '```markdown',
      idea,
      '```',
      '',
      '## Steps',
      '',
      'Ask at most 2 questions.',
      '',
      '## Practice',
      '',
      'Keep it short.',
      '',
      '## Format',
      '',
      '```markdown',
      '# <Title>',
      '## Items',
      '### <Item>',
      '```',
      '',
    ].join('\n');
    // ACT
    const run = render('ask', `idea=${pasted('idea.md', idea)}`);
    // ASSERT
    expect(run.status).toBe(0);
    expect(run.stdout).toBe(expected);
  });

  it("prints a round's review with the shared result and the round's own", () => {
    // ARRANGE
    const brief = '# Shared\n## Items\n### Beta';
    const verdict = '# Beta\n## Verdict\nDrop.';
    const item = '### Beta';
    // ACT
    const run = render(
      'judge',
      '--review',
      `--round=2:${pasted('item.md', item)}`,
      `brief=${pasted('brief.md', brief)}`,
      `verdict_result#2=${pasted('verdict.md', verdict)}`,
    );
    // ASSERT
    expect(run.stdout).toContain(brief);
    expect(run.stdout).toContain(verdict);
  });
});

describe('failure cases', () => {
  it('exits 1 naming a job the file does not have', () => {
    // ARRANGE
    const problem = 'The file has no job "nope".';
    // ACT
    const run = render('nope');
    // ASSERT
    expect(run.status).toBe(1);
    expect(run.stderr).toContain(problem);
  });

  it('exits 1 on an argument it does not know', () => {
    // ARRANGE
    const problem = 'Unknown argument: --loud';
    // ACT
    const run = render('ask', '--loud');
    // ASSERT
    expect(run.status).toBe(1);
    expect(run.stderr).toContain(problem);
  });

  it('exits 1 on a round that is not a number, and on a level it does not know', () => {
    // ARRANGE
    const [round, level] = ['--round needs <n>:<item-file>, got "two:x".', '--level reads chat or cli, got "voice".'];
    // ACT
    const runs = [render('look', '--round=two:x'), render('ask', '--level=voice')];
    // ASSERT
    expect(runs.map((run) => run.status)).toEqual([1, 1]);
    expect(runs[0]?.stderr).toContain(round);
    expect(runs[1]?.stderr).toContain(level);
  });
});

describe('edge cases', () => {
  it('prints the full-run CLI prompt with the full limit', () => {
    // ARRANGE
    const limit = 'Ask at most 6 questions about this.';
    // ACT
    const run = render('ask', '--full', '--level=cli', `idea=${pasted('idea2.md', 'x')}`);
    // ASSERT
    expect(run.stdout).toContain(limit);
  });
});
