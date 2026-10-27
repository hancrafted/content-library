import { joinPrompt } from '@/shared/components/core-components/try-prompt/prompt-sections.pure';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { doPrompt, reviewPrompt, roundStep, stepsOf } from './workflow-prompts.pure';
import type { TaskDef, WorkflowFile } from './workflow-schema.types';
import fixtureEn from './workflow.fixture.en.yml';

const file = parse(fixtureEn) as WorkflowFile;
const task = (id: string): TaskDef =>
  file.stages.flatMap((stage) => stage.jobs).find((each) => each.id === id) as TaskDef;
const joined = (prompt: ReturnType<typeof doPrompt>) =>
  joinPrompt({ sections: prompt.sections ?? [], slots: prompt.slots ?? [] }, {});
const examples = (id: string): readonly string[] => [task(id).details.example].flat();
/** The repeated job with a review of each round, so the round's own review field can be tested; the fixture reviews only `ask`. */
const reviewedLook = (): TaskDef => {
  const look = task('look');
  return {
    ...look,
    goal: { ...look.goal, review: 'Have a second chat check each note.' },
    review: {
      slots: [
        { id: 'brief', mode: 'single', label: 'Your brief', sample: look.slots[0]?.sample },
        { id: 'note_result', mode: 'single', label: "One chat's note", sample: examples('look')[0] },
      ],
      checks: ['Every finding is one line.', 'The note covers exactly one item.'],
    },
  };
};
/** The ranking job with a review of every note, for a review slot that takes several entries. */
const reviewedRank = (): TaskDef => {
  const rank = task('rank');
  const note = rank.slots.find((slot) => slot.id === 'note');
  return {
    ...rank,
    goal: { ...rank.goal, review: 'Have a second chat check the ranking.' },
    review: {
      slots: [{ id: 'note', mode: 'multiple', label: 'Note of chat', sample: note?.sample }],
      checks: ['Every item has a place.'],
    },
  };
};

describe('success cases', () => {
  it('places the template in a fenced block, leaving {{item}} and the slot markers for later', () => {
    // ARRANGE
    const job = task('look');
    const fenced = '```markdown\n# <Item>';
    // ACT
    const prompt = doPrompt(file, job, 'simple');
    const text = (prompt.sections ?? []).map((section) => section.text).join('\n');
    // ASSERT
    expect(text).toContain('{{item}}');
    expect(text).toContain(fenced);
    expect(prompt.slots?.map((slot) => slot.id)).toEqual(['brief']);
  });

  it('shows a section marked only for demo mode in demo mode, and one marked only for a full run in a full run', () => {
    // ARRANGE
    const practice = {
      heading: 'Practice run',
      purpose: 'scope',
      only: 'demo',
      text: 'Pick the simplest.',
    } as const;
    const whole = { heading: 'Full run', purpose: 'scope', only: 'full', text: 'Name what is open.' } as const;
    const base = task('look');
    const job: TaskDef = { ...base, do: { ...base.do, simple: [...base.do.simple, practice, whole] } };
    const headings = (demo: boolean) =>
      (doPrompt(file, job, { runtime: 'simple', demo }).sections ?? []).map((section) => section.heading);
    // ACT
    const demo = headings(true);
    const full = headings(false);
    // ASSERT
    expect(demo).toContain(practice.heading);
    expect(demo).not.toContain(whole.heading);
    expect(full).toContain(whole.heading);
    expect(full).not.toContain(practice.heading);
  });

  it('leaves a reviewer section marked only for a full run out of the review in demo mode', () => {
    // ARRANGE
    const whole = { heading: 'Full run', only: 'full', text: 'Check every round.' } as const;
    const withWhole: WorkflowFile = { ...file, reviewer: { sections: [...file.reviewer.sections, whole] } };
    const headings = (demo: boolean) =>
      (reviewPrompt(withWhole, reviewedLook(), { runtime: 'simple', demo }).sections ?? []).map((s) => s.heading);
    // ACT
    const demo = headings(true);
    const full = headings(false);
    // ASSERT
    expect(demo).not.toContain(whole.heading);
    expect(full).toContain(whole.heading);
  });

  it('hands the prompt the technique catalogue and keeps the technique ids of its sections', () => {
    // ARRANGE
    const job = task('ask');
    // ACT
    const prompt = doPrompt(file, job, 'simple');
    // ASSERT
    expect(prompt.techniques).toEqual(file.techniques);
    expect(prompt.sections?.some((section) => (section.techniques ?? []).length > 0)).toBe(true);
  });

  it('shows the sample of an empty slot in the joined prompt', () => {
    // ARRANGE
    const job = task('look');
    const sampled = '### Beta';
    // ACT
    const text = joined(doPrompt(file, job, 'technical'));
    // ASSERT
    expect(text).toContain(sampled);
    expect(text).not.toContain('{{');
  });

  it('builds the review from the general reviewer, numbered checks, the inputs under their labels and the template', () => {
    // ARRANGE
    const job = reviewedLook();
    const [check, label, template] = ['2. The note covers exactly one item', "### One chat's note", '## Finding'];
    // ACT
    const prompt = reviewPrompt(file, job);
    const text = joined(prompt);
    // ASSERT
    expect(text).toContain(check);
    expect(text).toContain(label);
    expect(text).toContain(template);
    expect(prompt.slots?.map((slot) => slot.id)).toEqual(['brief', 'note_result']);
    expect(text).not.toContain('{{');
  });

  it('lists each entry of a multiple review slot under its own label and numbered marker, each with its own sample', () => {
    // ARRANGE
    const rank = reviewedRank();
    const [first, last, firstSample, lastSample] = ['### Note of chat 1', '### Note of chat 2', '# Alpha', '# Beta'];
    // ACT
    const text = joined(reviewPrompt(file, rank));
    // ASSERT
    expect(text).toContain(first);
    expect(text).toContain(last);
    expect(text).toContain(firstSample);
    expect(text).toContain(lastSample);
    expect(text).not.toContain('{{');
  });

  it('makes one do step and one review step at each level, which a repeated stage then plays once per round', () => {
    // ARRANGE
    const job = reviewedLook();
    // ACT
    const simple = stepsOf(file, job, 'simple');
    const technical = stepsOf(file, job, 'technical');
    // ASSERT
    expect(simple.map((step) => [step.id, step.chat])).toEqual([
      ['do', undefined],
      ['review', undefined],
    ]);
    expect(technical.map((step) => step.id)).toEqual(['do', 'review']);
  });

  it('fills a round: its item into the do prompt and its number on the step', () => {
    // ARRANGE
    const job = task('look');
    const [step] = stepsOf(file, job, 'simple');
    const round = { number: 2, item: '### Beta\nThe second.' };
    // ACT
    const made = roundStep(step!, round, { previous: ['brief'], output: 'note' });
    const text = joined(made.prompt);
    // ASSERT
    expect(made.chat).toBe(round.number);
    expect(text).toContain(round.item);
    expect(text).not.toContain('{{item}}');
  });

  it('gives a round its own review field, and leaves the fields that take earlier results shared', () => {
    // ARRANGE
    const job = reviewedLook();
    const review = stepsOf(file, job, 'simple')[1];
    const round = { number: 2, item: '### Beta' };
    // ACT
    const made = roundStep(review!, round, { previous: ['brief'], output: 'note' });
    const text = joined(made.prompt);
    // ASSERT
    expect(made.prompt.slots?.map((slot) => slot.id)).toEqual(['brief', 'note_result#2']);
    expect(text).not.toContain('{{note_result}}');
  });
});

describe('failure cases', () => {
  it('has no review step for a task without a review', () => {
    // ARRANGE
    const ask: TaskDef = { ...task('ask'), review: undefined };
    // ACT
    const ids = stepsOf(file, ask, 'simple').map((step) => step.id);
    // ASSERT
    expect(ids).toEqual(['do']);
  });
});

describe('edge cases', () => {
  it('keeps the whole technical prompt, including its template, free of unresolved built-in markers', () => {
    // ARRANGE
    const all = file.stages.flatMap((stage) => stage.jobs);
    // ACT
    const left = all.flatMap((each) => [
      joined(doPrompt(file, each, 'technical')),
      joined(doPrompt(file, each, 'simple')).replaceAll('{{item}}', ''),
    ]);
    // ASSERT
    expect(left.filter((text) => /\{\{/.test(text))).toEqual([]);
  });
});
