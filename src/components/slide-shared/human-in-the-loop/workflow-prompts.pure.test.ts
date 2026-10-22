import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { joinPrompt } from '../core-components/try-prompt/prompt-sections.pure';
import summerPartyEn from './summer-party.en.yml';
import { doPrompt, reviewPrompt, stepsOf } from './workflow-prompts.pure';
import type { TaskDef, WorkflowFile } from './workflow-schema.types';

const file = parse(summerPartyEn) as WorkflowFile;
const task = (id: string): TaskDef =>
  file.stages.flatMap((stage) => stage.tasks).find((each) => each.id === id) as TaskDef;
const joined = (prompt: ReturnType<typeof doPrompt>) =>
  joinPrompt({ sections: prompt.sections ?? [], slots: prompt.slots ?? [] }, {});

describe('success cases', () => {
  it('fills {{n}} and places the template in a fenced block, leaving the slot markers for the paste-in', () => {
    // ARRANGE
    const research = task('venue');
    const chat = 2;
    // ACT
    const prompt = doPrompt(file, research, { runtime: 'simple', chat });
    const text = (prompt.sections ?? []).map((section) => section.text).join('\n');
    // ASSERT
    expect(text).toContain(`This is chat ${chat}. Take ticket number ${chat}`);
    expect(text).toContain('```markdown\n# <What was researched>');
    expect(text).toContain('{{tickets}}');
    expect(prompt.slots?.map((slot) => slot.id)).toEqual(['tickets']);
  });

  it('hands the prompt the technique catalogue and keeps the technique ids of its sections', () => {
    // ARRANGE
    const research = task('venue');
    // ACT
    const prompt = doPrompt(file, research, { runtime: 'simple', chat: 1 });
    // ASSERT
    expect(prompt.techniques).toEqual(file.techniques);
    expect(prompt.sections?.some((section) => (section.techniques ?? []).length > 0)).toBe(true);
  });

  it('shows the sample of an empty slot in the joined prompt', () => {
    // ARRANGE
    const research = task('venue');
    // ACT
    const text = joined(doPrompt(file, research, { runtime: 'simple', chat: 1 }));
    // ASSERT
    expect(text).toContain('## 3. Outdoor or garden venue');
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
    expect(text).toContain('# Old Mill');
    expect(text).toContain('# Riverside Garden Pavilion');
    expect(text).not.toContain('{{');
  });

  it('makes one step per chat in Simple and one orchestrator step in Technical, each with its review', () => {
    // ARRANGE
    const research = task('venue');
    const chats = Array.from({ length: research.fanOut ?? 0 }, (_, at) => at + 1);
    // ACT
    const simple = stepsOf(file, research, 'simple');
    const technical = stepsOf(file, research, 'technical');
    // ASSERT
    expect(simple.map((step) => step.chat)).toEqual([...chats, undefined]);
    expect(simple.map((step) => step.id)).toEqual([...chats.map(() => 'do'), 'review']);
    expect(technical.map((step) => [step.id, step.chat])).toEqual([
      ['do', undefined],
      ['review', undefined],
    ]);
  });
});

describe('failure cases', () => {
  it('has no review step for a task without a review', () => {
    // ARRANGE
    const interview = task('interview');
    // ACT
    const ids = stepsOf(file, interview, 'simple').map((step) => step.id);
    // ASSERT
    expect(ids).toEqual(['do']);
  });
});

describe('edge cases', () => {
  it('keeps the whole technical prompt, including its template, free of unresolved built-in markers', () => {
    // ARRANGE
    const all = file.stages.flatMap((stage) => stage.tasks);
    // ACT
    const left = all.flatMap((each) => [
      joined(doPrompt(file, each, { runtime: 'technical', chat: 1 })),
      joined(doPrompt(file, each, { runtime: 'simple', chat: 1 })),
    ]);
    // ASSERT
    expect(left.filter((text) => /\{\{/.test(text))).toEqual([]);
  });
});
