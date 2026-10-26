import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { joinPrompt } from '../core-components/try-prompt/prompt-sections.pure';
import vacationEn from './vacation.en.yml';
import { doPrompt, reviewPrompt, roundStep, stepsOf } from './workflow-prompts.pure';
import type { TaskDef, WorkflowFile } from './workflow-schema.types';

const file = parse(vacationEn) as WorkflowFile;
const task = (id: string): TaskDef =>
  file.stages.flatMap((stage) => stage.jobs).find((each) => each.id === id) as TaskDef;
const joined = (prompt: ReturnType<typeof doPrompt>) =>
  joinPrompt({ sections: prompt.sections ?? [], slots: prompt.slots ?? [] }, {});

describe('success cases', () => {
  it('places the template in a fenced block, leaving {{item}} and the slot markers for later', () => {
    // ARRANGE
    const research = task('venue');
    // ACT
    const prompt = doPrompt(file, research, 'simple');
    const text = (prompt.sections ?? []).map((section) => section.text).join('\n');
    // ASSERT
    expect(text).toContain('{{item}}');
    expect(text).toContain('```markdown\n# <What was researched>');
    expect(prompt.slots?.map((slot) => slot.id)).toEqual(['tickets']);
  });

  it('hands the prompt the technique catalogue and keeps the technique ids of its sections', () => {
    // ARRANGE
    const research = task('venue');
    // ACT
    const prompt = doPrompt(file, research, 'simple');
    // ASSERT
    expect(prompt.techniques).toEqual(file.techniques);
    expect(prompt.sections?.some((section) => (section.techniques ?? []).length > 0)).toBe(true);
  });

  it('shows the sample of an empty slot in the joined prompt', () => {
    // ARRANGE
    const research = task('venue');
    // ACT
    const text = joined(doPrompt(file, research, 'technical'));
    // ASSERT
    expect(text).toContain('### 3. Villa or guesthouse');
    expect(text).not.toContain('{{');
  });

  it('builds the review from the general reviewer, numbered checks, the inputs under their labels and the template', () => {
    // ARRANGE
    const research = task('venue');
    // ACT
    const prompt = reviewPrompt(file, research);
    const text = joined(prompt);
    // ASSERT
    expect(text).toContain('2. The result covers exactly one ticket');
    expect(text).toContain("### One chat's research result");
    expect(text).toContain('## Fit against the requirements');
    expect(prompt.slots?.map((slot) => slot.id)).toEqual(['tickets', 'research_result']);
    expect(text).not.toContain('{{');
  });

  it('lists each entry of a multiple review slot under its own label and numbered marker, each with its own sample', () => {
    // ARRANGE
    const compare = task('compare');
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
    const research = task('venue');
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
    const research = task('venue');
    const [step] = stepsOf(file, research, 'simple');
    const round = { number: 2, item: '### Hotel\nFind one hotel.' };
    // ACT
    const made = roundStep(step!, round, { previous: ['tickets'], output: 'research' });
    const text = joined(made.prompt);
    // ASSERT
    expect(made.chat).toBe(round.number);
    expect(text).toContain(round.item);
    expect(text).not.toContain('{{item}}');
  });

  it('gives a round its own review field, and leaves the fields that take earlier results shared', () => {
    // ARRANGE
    const research = task('venue');
    const review = stepsOf(file, research, 'simple')[1];
    const round = { number: 3, item: '### Villa' };
    // ACT
    const made = roundStep(review!, round, { previous: ['tickets'], output: 'research' });
    const text = joined(made.prompt);
    // ASSERT
    expect(made.prompt.slots?.map((slot) => slot.id)).toEqual(['tickets', 'research_result#3']);
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
