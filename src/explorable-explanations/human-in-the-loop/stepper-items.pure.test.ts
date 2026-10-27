import { describe, expect, it } from 'vitest';
import { itemsOf, openItemOf } from './stepper-items.pure';
import { workflowOf } from './workflow-file-adapter.pure';
import { loadWorkflow } from './workflow-loader.pure';
import { checkedKey, resultKey, runOf } from './workflow-run.pure';
import { workflowView } from './workflow-view.pure';
import fixtureEn from './workflow.fixture.en.yml';

const loaded = loadWorkflow(fixtureEn);
if ('problems' in loaded) throw new Error(loaded.problems.join('\n'));
const WORKFLOW = workflowOf(loaded.file);
const EACH = 'each';

const allItemsFor = (level: 'simple' | 'technical', results: Record<string, string>, demo = true) => {
  const stage = workflowView(WORKFLOW, { level }).stages.find((each) => each.id === EACH)!;
  const run = runOf(loaded.file, { results, demo }).stages.find((each) => each.id === EACH)!;
  return itemsOf(stage, run);
};
/** The items of the stage's first job, `look`; the stage's other job, `judge`, plays each round after it. */
const itemsFor = (level: 'simple' | 'technical', results: Record<string, string>, demo = true) =>
  allItemsFor(level, results, demo).filter((item) => item.job.id === 'look');

describe('success cases', () => {
  it('plays a repeated stage once per round in Simple, every job of a round in order, each titled by its example H3, with a review only where the job has one', () => {
    // ARRANGE
    const results = {};
    const doOnly = { do: 1, review: 0 };
    const reviewed = { do: 1, review: 1 };
    // ACT
    const items = allItemsFor('simple', results);
    // ASSERT
    expect(items.map((item) => item.key)).toEqual(['look#1', 'judge#1', 'look#2', 'judge#2']);
    expect(items.map((item) => item.round?.title)).toEqual(['Alpha', 'Alpha', 'Beta', 'Beta']);
    expect(items.map((item) => ({ do: item.doSteps.length, review: item.reviewSteps.length }))).toEqual([
      doOnly,
      reviewed,
      doOnly,
      reviewed,
    ]);
  });

  it('fills a round with its item and takes its state from the run', () => {
    // ARRANGE
    const results = { [resultKey(EACH, 'look', 2)]: 'pasted' };
    const item = '### Beta';
    // ACT
    const items = itemsFor('simple', results);
    const text = items[1]?.doSteps[0]?.prompt.sections?.map((section) => section.text).join('\n');
    // ASSERT
    expect(items.map((each) => each.state)).toEqual(['open', 'done']);
    expect(text).toContain(item);
  });

  it('names, for each round, the key its checked mark is written to, so the run model reads it back', () => {
    // ARRANGE
    const items = itemsFor('simple', {});
    const rounds = [1, 2];
    // ACT
    const marks = items.map((item) => item.checkedAs);
    // ASSERT
    expect(marks).toEqual(rounds.map((round) => checkedKey(EACH, 'look', round)));
  });

  it('opens the item of the job whose card was pressed, the first round of a repeated one', () => {
    // ARRANGE
    const items = itemsFor('simple', {});
    // ACT
    const at = openItemOf(items, 'look');
    // ASSERT
    expect(at).toBe('0');
  });

  it('opens the item of the round of the job whose card was pressed', () => {
    // ARRANGE
    const items = itemsFor('simple', {});
    // ACT
    const at = openItemOf(items, 'look', 2);
    // ASSERT
    expect(at).toBe('1');
  });

  it('gives the one CLI item of a repeated stage the state its rounds share', () => {
    // ARRANGE
    const results = { [resultKey(EACH, 'look')]: 'orchestrated', [checkedKey(EACH, 'look')]: 'yes' };
    // ACT
    const items = itemsFor('technical', results);
    // ASSERT
    expect(items.map((item) => item.state)).toEqual(['checked']);
  });
});

describe('failure cases', () => {
  it('keeps no round on the mark of a job whose stage does not repeat, and takes it from the stage and job', () => {
    // ARRANGE
    const items = itemsFor('technical', {});
    // ACT
    const marks = items.map((item) => item.checkedAs);
    // ASSERT
    expect(marks).toEqual([checkedKey(EACH, 'look')]);
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

  it('opens the first item of the job for a round it does not play', () => {
    // ARRANGE
    const items = itemsFor('simple', {});
    // ACT
    const at = openItemOf(items, 'look', 9);
    // ASSERT
    expect(at).toBe('0');
  });

  it('shows a single item without rounds in Technical, where one orchestrator runs them all', () => {
    // ARRANGE
    const results = {};
    // ACT
    const items = itemsFor('technical', results);
    // ASSERT
    expect(items.map((item) => item.key)).toEqual(['look']);
    expect(items[0]?.round).toBeUndefined();
  });
});

describe('edge cases', () => {
  it('follows the pasted items in full mode and fills each round with its own item', () => {
    // ARRANGE
    const pasted = '# T\n## Items\n### One\na\n### Two\nb\n### Three\nc\n### Four\nd\n';
    const results = { [resultKey('ask', 'ask')]: pasted };
    const fourth = '### Four\nd';
    // ACT
    const items = itemsFor('simple', results, false);
    const last = items
      .at(-1)
      ?.doSteps[0]?.prompt.sections?.map((section) => section.text)
      .join('\n');
    // ASSERT
    expect(items.map((item) => item.round?.title)).toEqual(['One', 'Two', 'Three', 'Four']);
    expect(last).toContain(fourth);
  });
});
