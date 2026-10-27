import { describe, expect, it } from 'vitest';
import { itemsOf, openItemOf } from './stepper-items.pure';
import vacationEn from './vacation.en.yml';
import { workflowOf } from './workflow-file-adapter.pure';
import { loadWorkflow } from './workflow-loader.pure';
import { checkedKey, resultKey, runOf } from './workflow-run.pure';
import { workflowView } from './workflow-view.pure';

const loaded = loadWorkflow(vacationEn);
if ('problems' in loaded) throw new Error(loaded.problems.join('\n'));
const WORKFLOW = workflowOf(loaded.file);
const RESEARCH = 'research';

const itemsFor = (level: 'simple' | 'technical', results: Record<string, string>, demo = true) => {
  const stage = workflowView(WORKFLOW, { level }).stages.find((each) => each.id === RESEARCH)!;
  const run = runOf(loaded.file, { results, demo }).stages.find((each) => each.id === RESEARCH)!;
  return itemsOf(stage, run);
};

describe('success cases', () => {
  it('plays a repeated stage once per round in Simple, each round titled by its example H3, with no review when the job has none', () => {
    // ARRANGE
    const results = {};
    const doOnly = { do: 1, review: 0 };
    // ACT
    const items = itemsFor('simple', results);
    // ASSERT
    expect(items.map((item) => item.key)).toEqual(['stay#1', 'stay#2', 'stay#3']);
    expect(items.map((item) => item.round?.title)).toEqual(['Apartment', 'Small hotel', 'Guesthouse']);
    expect(items.map((item) => ({ do: item.doSteps.length, review: item.reviewSteps.length }))).toEqual(
      items.map(() => doOnly),
    );
  });

  it('fills a round with its item and takes its state from the run', () => {
    // ARRANGE
    const results = { [resultKey(RESEARCH, 'stay', 2)]: 'pasted' };
    const item = '### Small hotel';
    // ACT
    const items = itemsFor('simple', results);
    const text = items[1]?.doSteps[0]?.prompt.sections?.map((section) => section.text).join('\n');
    // ASSERT
    expect(items.map((each) => each.state)).toEqual(['open', 'done', 'open']);
    expect(text).toContain(item);
  });

  it('names, for each round, the key its checked mark is written to, so the run model reads it back', () => {
    // ARRANGE
    const items = itemsFor('simple', {});
    const rounds = [1, 2, 3];
    // ACT
    const marks = items.map((item) => item.checkedAs);
    // ASSERT
    expect(marks).toEqual(rounds.map((round) => checkedKey(RESEARCH, 'stay', round)));
  });

  it('opens the item of the job whose card was pressed, the first round of a repeated one', () => {
    // ARRANGE
    const items = itemsFor('simple', {});
    // ACT
    const at = openItemOf(items, 'stay');
    // ASSERT
    expect(at).toBe('0');
  });

  it('opens the item of the round of the job whose card was pressed', () => {
    // ARRANGE
    const items = itemsFor('simple', {});
    // ACT
    const at = openItemOf(items, 'stay', 3);
    // ASSERT
    expect(at).toBe('2');
  });

  it('gives the one CLI item of a repeated stage the state its rounds share', () => {
    // ARRANGE
    const results = { [resultKey(RESEARCH, 'stay')]: 'orchestrated', [checkedKey(RESEARCH, 'stay')]: 'yes' };
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
    expect(marks).toEqual([checkedKey(RESEARCH, 'stay')]);
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
    const at = openItemOf(items, 'stay', 9);
    // ASSERT
    expect(at).toBe('0');
  });

  it('shows a single item without rounds in Technical, where one orchestrator runs them all', () => {
    // ARRANGE
    const results = {};
    // ACT
    const items = itemsFor('technical', results);
    // ASSERT
    expect(items.map((item) => item.key)).toEqual(['stay']);
    expect(items[0]?.round).toBeUndefined();
  });
});

describe('edge cases', () => {
  it('follows the pasted kinds of stay in full mode and fills each round with its own item', () => {
    // ARRANGE
    const pasted = '# T\n## Research\n### One\na\n### Two\nb\n### Three\nc\n### Four\nd\n';
    const results = { [resultKey('brief', 'interview')]: pasted };
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
