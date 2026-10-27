import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { renderPrompt } from './workflow.node';

const fixture = readFileSync(new URL('./workflow.fixture.en.yml', import.meta.url), 'utf8');
/** A rendered prompt that holds `part`, so a result of problems fails the assertion instead of reading as empty text. */
const holding = (part: string) => ({ text: expect.stringContaining(part) as unknown });

describe('success cases', () => {
  it("renders a job's demo prompt with its slots filled, its demo limit and its template fenced", () => {
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
    ].join('\n');
    // ACT
    const result = renderPrompt(fixture, { job: 'ask', values: { idea } });
    // ASSERT
    expect(result).toEqual({ text: expected });
  });

  it("renders a job's review prompt with its checks and the result to review", () => {
    // ARRANGE
    const brief = '# Mine\n## Items\n### Gamma';
    const check = '1. Every item is an H3.';
    const input = `### The brief to review\n\n\`\`\`markdown\n${brief}\n\`\`\``;
    // ACT
    const result = renderPrompt(fixture, { job: 'ask', step: 'review', values: { brief_result: brief } });
    // ASSERT
    expect(result).toMatchObject(holding(check));
    expect(result).toMatchObject(holding(input));
  });

  it("fills a job's same-stage input from the job it needs", () => {
    // ARRANGE
    const ranking = '# Ranking\n## Order\n1. Gamma';
    // ACT
    const result = renderPrompt(fixture, { job: 'finish', values: { ranking } });
    // ASSERT
    expect(result).toMatchObject(holding(ranking));
  });
});

describe('failure cases', () => {
  it("returns the loader's problems for a file that does not load", () => {
    // ARRANGE
    const broken = 'stages: [';
    const expected = { problems: ['The file is not valid YAML.'] };
    // ACT
    const result = renderPrompt(broken, { job: 'ask' });
    // ASSERT
    expect(result).toEqual(expected);
  });

  it('names a job the file does not have', () => {
    // ARRANGE
    const expected = { problems: ['The file has no job "nope".'] };
    // ACT
    const result = renderPrompt(fixture, { job: 'nope' });
    // ASSERT
    expect(result).toEqual(expected);
  });

  it('names a review step a job does not have', () => {
    // ARRANGE
    const expected = { problems: ['Job "look" has no review step.'] };
    // ACT
    const result = renderPrompt(fixture, { job: 'look', step: 'review' });
    // ASSERT
    expect(result).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('renders a full run with the full limit and the full-only section, leaving the demo-only one out', () => {
    // ARRANGE
    const limit = 'Ask at most 6 questions.';
    const full = '## Thorough';
    const demo = '## Practice';
    // ACT
    const result = renderPrompt(fixture, { job: 'ask', demo: false, values: { idea: 'x' } });
    // ASSERT
    expect(result).toMatchObject(holding(limit));
    expect(result).toMatchObject(holding(full));
    expect(result).not.toMatchObject(holding(demo));
  });

  it("fills a round's do prompt with its item and its own result of the job it needs", () => {
    // ARRANGE
    const round = { number: 2, item: '### Beta\nThe second.' };
    const note = '# Beta\n## Finding\nMine.';
    // ACT
    const result = renderPrompt(fixture, { job: 'judge', round, values: { note_2: note } });
    // ASSERT
    expect(result).toMatchObject(holding(round.item));
    expect(result).toMatchObject(holding(note));
  });

  it("fills a round's review with the shared earlier result and the round's own result", () => {
    // ARRANGE
    const round = { number: 2, item: '### Beta' };
    const brief = '# Shared\n## Items\n### Beta';
    const verdict = '# Beta\n## Verdict\nDrop.';
    // ACT
    const result = renderPrompt(fixture, {
      job: 'judge',
      step: 'review',
      round,
      values: { brief, 'verdict_result#2': verdict },
    });
    // ASSERT
    expect(result).toMatchObject(holding(brief));
    expect(result).toMatchObject(holding(verdict));
  });

  it('expands a multiple slot into one fenced block per round', () => {
    // ARRANGE
    const notes = ['# A\n## Finding\nOne.', '# B\n## Finding\nTwo.'];
    // ACT
    const result = renderPrompt(fixture, { job: 'rank', values: { note_1: notes[0]!, note_2: notes[1]! } });
    // ASSERT
    expect(result).toMatchObject(holding(notes[0]!));
    expect(result).toMatchObject(holding(notes[1]!));
  });
});
