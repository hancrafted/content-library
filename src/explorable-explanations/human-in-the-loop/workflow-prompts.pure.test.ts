import { joinPrompt } from '@/shared/components/core-components/try-prompt/prompt-sections.pure';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import vacationEn from './vacation.en.yml';
import { doPrompt, reviewPrompt, roundStep, stepsOf } from './workflow-prompts.pure';
import type { TaskDef, WorkflowFile } from './workflow-schema.types';

const file = parse(vacationEn) as WorkflowFile;
const task = (id: string): TaskDef =>
  file.stages.flatMap((stage) => stage.jobs).find((each) => each.id === id) as TaskDef;
const joined = (prompt: ReturnType<typeof doPrompt>) =>
  joinPrompt({ sections: prompt.sections ?? [], slots: prompt.slots ?? [] }, {});
/** The research job with a review of each round, so the round's own review field can be tested; the file reviews only the gate jobs. */
const reviewedStay = (): TaskDef => {
  const stay = task('stay');
  return {
    ...stay,
    goal: { ...stay.goal, review: 'Have a second chat check each result.' },
    review: {
      slots: [
        { id: 'spec', mode: 'single', label: 'Your requirements', sample: stay.slots[0]?.sample },
        { id: 'research_result', mode: 'single', label: "One chat's research result", sample: stay.details.example[0] },
      ],
      checks: ['Every acceptance criterion is met, not met or not found.', 'The result covers exactly one stay.'],
    },
  };
};
/** The ranking job with a review of all three research results, for a review slot that takes several entries. */
const reviewedCompare = (): TaskDef => {
  const compare = task('compare');
  const research = compare.slots.find((slot) => slot.id === 'research');
  return {
    ...compare,
    goal: { ...compare.goal, review: 'Have a second chat check the ranking.' },
    review: {
      slots: [{ id: 'research', mode: 'multiple', label: 'Research result of chat', sample: research?.sample }],
      checks: ['Every stay has a place.'],
    },
  };
};

describe('success cases', () => {
  it('places the template in a fenced block, leaving {{item}} and the slot markers for later', () => {
    // ARRANGE
    const research = task('stay');
    const fenced = '```markdown\n# <Stay name, town>';
    // ACT
    const prompt = doPrompt(file, research, 'simple');
    const text = (prompt.sections ?? []).map((section) => section.text).join('\n');
    // ASSERT
    expect(text).toContain('{{item}}');
    expect(text).toContain(fenced);
    expect(prompt.slots?.map((slot) => slot.id)).toEqual(['spec']);
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
    const base = task('stay');
    const research: TaskDef = { ...base, do: { ...base.do, simple: [...base.do.simple, practice, whole] } };
    const headings = (demo: boolean) =>
      (doPrompt(file, research, { runtime: 'simple', demo }).sections ?? []).map((section) => section.heading);
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
      (reviewPrompt(withWhole, reviewedStay(), { runtime: 'simple', demo }).sections ?? []).map((s) => s.heading);
    // ACT
    const demo = headings(true);
    const full = headings(false);
    // ASSERT
    expect(demo).not.toContain(whole.heading);
    expect(full).toContain(whole.heading);
  });

  it('hands the prompt the technique catalogue and keeps the technique ids of its sections', () => {
    // ARRANGE
    const research = task('stay');
    // ACT
    const prompt = doPrompt(file, research, 'simple');
    // ASSERT
    expect(prompt.techniques).toEqual(file.techniques);
    expect(prompt.sections?.some((section) => (section.techniques ?? []).length > 0)).toBe(true);
  });

  it('shows the sample of an empty slot in the joined prompt', () => {
    // ARRANGE
    const research = task('stay');
    const sampled = '### Guesthouse';
    // ACT
    const text = joined(doPrompt(file, research, 'technical'));
    // ASSERT
    expect(text).toContain(sampled);
    expect(text).not.toContain('{{');
  });

  it('builds the review from the general reviewer, numbered checks, the inputs under their labels and the template', () => {
    // ARRANGE
    const research = reviewedStay();
    const [check, label, template] = [
      '2. The result covers exactly one stay',
      "### One chat's research result",
      '## Fit against the criteria',
    ];
    // ACT
    const prompt = reviewPrompt(file, research);
    const text = joined(prompt);
    // ASSERT
    expect(text).toContain(check);
    expect(text).toContain(label);
    expect(text).toContain(template);
    expect(prompt.slots?.map((slot) => slot.id)).toEqual(['spec', 'research_result']);
    expect(text).not.toContain('{{');
  });

  it('lists each entry of a multiple review slot under its own label and numbered marker, each with its own sample', () => {
    // ARRANGE
    const compare = reviewedCompare();
    // ACT
    const text = joined(reviewPrompt(file, compare));
    // ASSERT
    expect(text).toContain('### Research result of chat 1');
    expect(text).toContain('### Research result of chat 3');
    expect(text).toContain('# Casa Blu');
    expect(text).toContain('# Villa Mare');
    expect(text).not.toContain('{{');
  });

  it('makes one do step and one review step at each level, which a repeated stage then plays once per round', () => {
    // ARRANGE
    const research = reviewedStay();
    // ACT
    const simple = stepsOf(file, research, 'simple');
    const technical = stepsOf(file, research, 'technical');
    // ASSERT
    expect(simple.map((step) => [step.id, step.chat])).toEqual([
      ['do', undefined],
      ['review', undefined],
    ]);
    expect(technical.map((step) => step.id)).toEqual(['do', 'review']);
  });

  it('fills a round: its item into the do prompt and its number on the step', () => {
    // ARRANGE
    const research = task('stay');
    const [step] = stepsOf(file, research, 'simple');
    const round = { number: 2, item: '### Small hotel\nOne small hotel.' };
    // ACT
    const made = roundStep(step!, round, { previous: ['spec'], output: 'research' });
    const text = joined(made.prompt);
    // ASSERT
    expect(made.chat).toBe(round.number);
    expect(text).toContain(round.item);
    expect(text).not.toContain('{{item}}');
  });

  it('gives a round its own review field, and leaves the fields that take earlier results shared', () => {
    // ARRANGE
    const research = reviewedStay();
    const review = stepsOf(file, research, 'simple')[1];
    const round = { number: 3, item: '### Guesthouse' };
    // ACT
    const made = roundStep(review!, round, { previous: ['spec'], output: 'research' });
    const text = joined(made.prompt);
    // ASSERT
    expect(made.prompt.slots?.map((slot) => slot.id)).toEqual(['spec', 'research_result#3']);
    expect(text).not.toContain('{{research_result}}');
  });
});

describe('failure cases', () => {
  it('has no review step for a task without a review', () => {
    // ARRANGE
    const interview: TaskDef = { ...task('interview'), review: undefined };
    // ACT
    const ids = stepsOf(file, interview, 'simple').map((step) => step.id);
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
