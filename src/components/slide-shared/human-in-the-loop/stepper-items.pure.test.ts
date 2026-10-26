import { describe, expect, it } from 'vitest';
import { itemsOf, openItemOf } from './stepper-items.pure';
import summerPartyEn from './summer-party.en.yml';
import { workflowOf } from './workflow-file-adapter.pure';
import { loadWorkflow } from './workflow-loader.pure';
import { checkedKey, resultKey, runOf } from './workflow-run.pure';
import { workflowView } from './workflow-view.pure';

const loaded = loadWorkflow(summerPartyEn);
if ('problems' in loaded) throw new Error(loaded.problems.join('\n'));
const WORKFLOW = workflowOf(loaded.file);
const RESEARCH = 'research';

const itemsFor = (level: 'simple' | 'technical', results: Record<string, string>, teaching = true) => {
  const stage = workflowView(WORKFLOW, { level }).stages.find((each) => each.id === RESEARCH)!;
  const run = runOf(loaded.file, { results, teaching }).stages.find((each) => each.id === RESEARCH)!;
  return itemsOf(stage, run);
};

describe('success cases', () => {
  it('plays a repeated stage once per round in Simple, each round titled by its example H3 and holding its own review', () => {
    // ARRANGE
    const results = {};
    // ACT
    const items = itemsFor('simple', results);
    // ASSERT
    expect(items.map((item) => item.key)).toEqual(['venue#1', 'venue#2', 'venue#3']);
    expect(items.map((item) => item.round?.title)).toEqual([
      '1. Event hall',
      '2. Hotel with a conference floor',
      '3. Outdoor or garden venue',
    ]);
    expect(items.every((item) => item.doSteps.length === 1 && item.reviewSteps.length === 1)).toBe(true);
  });

  it('fills a round with its item and takes its state from the run', () => {
    // ARRANGE
    const results = { [resultKey(RESEARCH, 'venue', 2)]: 'pasted' };
    // ACT
    const items = itemsFor('simple', results);
    const text = items[1]?.doSteps[0]?.prompt.sections?.map((section) => section.text).join('\n');
    // ASSERT
    expect(items.map((item) => item.state)).toEqual(['open', 'done', 'open']);
    expect(text).toContain('### 2. Hotel with a conference floor');
  });

  it('names, for each round, the key its checked mark is written to, so the run model reads it back', () => {
    // ARRANGE
    const items = itemsFor('simple', {});
    const rounds = [1, 2, 3];
    // ACT
    const marks = items.map((item) => item.checkedAs);
    // ASSERT
    expect(marks).toEqual(rounds.map((round) => checkedKey(RESEARCH, 'venue', round)));
  });

  it('opens the item of the job whose card was pressed, the first round of a repeated one', () => {
    // ARRANGE
    const items = itemsFor('simple', {});
    // ACT
    const at = openItemOf(items, 'venue');
    // ASSERT
    expect(at).toBe('0');
  });
});

describe('failure cases', () => {
  it('keeps no round on the mark of a job whose stage does not repeat, and takes it from the stage and job', () => {
    // ARRANGE
    const items = itemsFor('technical', {});
    // ACT
    const marks = items.map((item) => item.checkedAs);
    // ASSERT
    expect(marks).toEqual([checkedKey(RESEARCH, 'venue')]);
  });

  it('opens the first item for no job and for a job the stage does not hold', () => {
    // ARRANGE
    const items = itemsFor('simple', {});
    // ACT
    const none = openItemOf(items, null);
    const unknown = openItemOf(items, 'ghost');
    // ASSERT
    expect([none, unknown]).toEqual(['0', '0']);
  });

  it('shows a single item without rounds in Technical, where one orchestrator runs them all', () => {
    // ARRANGE
    const results = {};
    // ACT
    const items = itemsFor('technical', results);
    // ASSERT
    expect(items.map((item) => item.key)).toEqual(['venue']);
    expect(items[0]?.round).toBeUndefined();
  });
});

describe('edge cases', () => {
  it('follows the pasted tickets in full mode and keeps each round its own review field', () => {
    // ARRANGE
    const pasted = '# T\n## Tickets\n### One\na\n### Two\nb\n### Three\nc\n### Four\nd\n';
    const results = { [resultKey('tickets', 'tickets')]: pasted };
    // ACT
    const items = itemsFor('simple', results, false);
    const fields = items.map((item) => item.reviewSteps[0]?.prompt.slots?.map((slot) => slot.id).at(-1));
    // ASSERT
    expect(items.map((item) => item.round?.title)).toEqual(['One', 'Two', 'Three', 'Four']);
    expect(fields).toEqual(['research_result#1', 'research_result#2', 'research_result#3', 'research_result#4']);
  });
});
