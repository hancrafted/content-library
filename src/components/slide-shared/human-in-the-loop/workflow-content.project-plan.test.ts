import { describe, expect, it } from 'vitest';
import { joinPrompt, type PromptSlot } from '../core-components/try-prompt/prompt-sections.pure';
import { itemsOf } from './stepper-items.pure';
import { workflowFor } from './workflow-data';
import { tasksOf } from './workflow-outputs.pure';
import { runOf } from './workflow-run.pure';
import { slotSample } from './workflow-sample.pure';
import type { TaskDef } from './workflow-schema.types';
import { workflowView } from './workflow-view.pure';

/*
 * The project-plan Workflow held to the decisions of epic #372: six stages that teach a discipline each, jobs in
 * `needs` order, caps of teaching mode next to their full values, prompts without the scenario, a practice run and a
 * subagent per round in the CLI prompts, and the summer party as the sample of the first job only.
 */

const DISCIPLINES = ['Project planning', 'Requirements engineering', 'Project management', 'Quality assurance'];
const LOCALES = ['en', 'de'] as const;
const { file } = workflowFor('project-plan', 'en');
const WORKFLOW = workflowFor('project-plan', 'en');
const task = (id: string): TaskDef => tasksOf(file).find((each) => each.id === id) as TaskDef;
const stage = (id: string) => file.stages.find((each) => each.id === id)!;
const textOf = (prompt: { sections?: readonly { text: string }[] }) =>
  (prompt.sections ?? []).map((section) => section.text).join('\n');
const joined = (step: { prompt: { sections?: readonly { text: string }[]; slots?: readonly PromptSlot[] } }) =>
  joinPrompt({ sections: step.prompt.sections ?? [], slots: step.prompt.slots ?? [] }, {});
const doStep = (
  id: string,
  level: 'simple' | 'technical',
  options: { teaching?: boolean; rounds?: Record<string, number> } = {},
) =>
  workflowView(WORKFLOW, { level, ...options })
    .stages.flatMap((each) => each.jobs)
    .find((each) => each.id === id)!.task.steps[0]!;

describe('success cases', () => {
  it('walks six stages from a high-level plan to a review, with the gates of the epic', () => {
    // ARRANGE
    const ids = ['plan', 'epics', 'requirements', 'execute', 'aggregate', 'review'];
    const gates = [1, undefined, 2, undefined, undefined, 3];
    // ACT
    const stages = file.stages;
    // ASSERT
    expect(stages.map((each) => each.id)).toEqual(ids);
    expect(stages.map((each) => each.gate)).toEqual(gates);
  });

  it.each(LOCALES)(
    'gives every stage a summary of at most eight words and a learning goal naming its discipline, in %s',
    (locale) => {
      // ARRANGE
      const maxWords = 8;
      const { file: loaded } = workflowFor('project-plan', locale);
      // ACT
      const words = loaded.stages.map((each) => (each.summary ?? '').trim().split(/\s+/).length);
      // ASSERT
      expect(words.every((count) => count > 0 && count <= maxWords)).toBe(true);
      if (locale === 'en') {
        expect(
          loaded.stages.every((each) => DISCIPLINES.some((name) => each.learningGoal.startsWith(`${name}:`))),
        ).toBe(true);
      }
    },
  );

  it('keeps every cap of teaching mode next to its full value', () => {
    // ARRANGE
    const rounds = { epics: 2, execute: 4 };
    const questions = { full: 8, teaching: 5 };
    const scope = 3;
    // ACT
    const actual = { epics: stage('epics').foreach?.teaching, execute: stage('execute').foreach?.teaching };
    // ASSERT
    expect(actual).toEqual(rounds);
    expect(task('grill').limits).toEqual({ questions });
    expect(task('scope').limits).toEqual({ questions: { full: scope, teaching: scope } });
  });

  it('prefills the summer party as the sample of the task job and no other prompt names it', () => {
    // ARRANGE
    const free = task('task').slots.find((slot) => slot.free)!;
    const prose = [
      ...file.reviewer.sections,
      ...tasksOf(file).flatMap((each) => [...each.do.simple, ...each.do.technical]),
    ];
    // ACT
    const sample = slotSample(file, free) as string;
    const mentions = prose.filter((section) => /summer|party|200|Europe/i.test(section.text));
    // ASSERT
    expect(sample).toContain('summer party');
    expect(sample).toContain('200 employees');
    expect(mentions).toEqual([]);
  });

  it('makes every prompt a practice run that marks invented numbers as assumptions, in Chat and CLI', () => {
    // ARRANGE
    const texts = tasksOf(file).flatMap((each) => [
      textOf({ sections: each.do.simple }),
      textOf({ sections: each.do.technical }),
    ]);
    // ACT
    const missing = texts.filter((text) => !/practice run/i.test(text) || !/assumption/i.test(text));
    // ASSERT
    expect(missing).toEqual([]);
  });

  it('asks the CLI prompt of a repeated stage to orchestrate one subagent per round', () => {
    // ARRANGE
    const repeated = ['grill', 'spec', 'ticket'];
    // ACT
    const texts = repeated.map((id) => textOf({ sections: task(id).do.technical }));
    // ASSERT
    expect(texts.every((text) => /orchestrator/.test(text) && /one subagent per/.test(text))).toBe(true);
  });

  it('fills the grill cap by mode: five questions in teaching mode, eight in full mode', () => {
    // ARRANGE
    const asked = (teaching: boolean) => joined(doStep('grill', 'simple', { teaching }));
    const { teaching: fewer, full: more } = task('grill').limits!.questions!;
    // ACT
    const teaching = asked(true);
    const full = asked(false);
    // ASSERT
    expect(teaching).toContain(`at most ${fewer} questions`);
    expect(full).toContain(`at most ${more} questions`);
    expect(teaching).not.toContain('{{limit');
  });

  it('checks each round against its own H3 item in Chat', () => {
    // ARRANGE
    const run = runOf(file, { results: {}, teaching: true }).stages.find((each) => each.id === 'epics')!;
    const view = workflowView(WORKFLOW, { level: 'simple' }).stages.find((each) => each.id === 'epics')!;
    // ACT
    const items = itemsOf(view, run).filter((item) => item.job.id === 'grill');
    const review = joined(items[1]!.reviewSteps[0]!);
    // ASSERT
    expect(review).toContain(`### ${items[1]!.round!.title}`);
    expect(review).not.toContain('{{item}}');
  });

  it('gives each round of the spec job its own grill result, not the one of another round', () => {
    // ARRANGE
    const run = runOf(file, { results: {}, teaching: true }).stages.find((each) => each.id === 'epics')!;
    const view = workflowView(WORKFLOW, { level: 'simple' }).stages.find((each) => each.id === 'epics')!;
    // ACT
    const items = itemsOf(view, run).filter((item) => item.job.id === 'spec');
    const slotIds = items.map((item) => item.doSteps[0]!.prompt.slots?.map((slot) => slot.id));
    // ASSERT
    expect(slotIds).toEqual([
      ['plan', 'grill_1'],
      ['plan', 'grill_2'],
    ]);
  });

  it('expands the merge of the epic specs into one entry per round played', () => {
    // ARRANGE
    const fields = (rounds: number) =>
      doStep('aggregate', 'simple', { teaching: false, rounds: { epics: rounds } }).prompt.slots?.length;
    const text = (rounds: number) =>
      textOf(doStep('aggregate', 'simple', { teaching: false, rounds: { epics: rounds } }).prompt);
    const three = 3;
    const five = 5;
    // ACT
    const entries = [text(three), text(five)];
    // ASSERT
    expect(fields(three)).toBe(1);
    expect(entries[0]).toContain(`{{spec_${three}}}`);
    expect(entries[0]).not.toContain(`{{spec_${three + 1}}}`);
    expect(entries[1]).toContain(`{{spec_${five}}}`);
  });
});

describe('failure cases', () => {
  it('gives the final job no review and no output, and every other job both', () => {
    // ARRANGE
    const all = tasksOf(file);
    // ACT
    const last = all.at(-1)!;
    const others = all.slice(0, -1);
    // ASSERT
    expect(last.id).toBe('html');
    expect([last.output, last.review]).toEqual([undefined, undefined]);
    expect(others.every((each) => each.review !== undefined && each.output !== undefined)).toBe(true);
  });

  it('drops the checks about one round from the CLI review, which reviews every round at once', () => {
    // ARRANGE
    const review = (level: 'simple' | 'technical') =>
      joined(
        workflowView(WORKFLOW, { level })
          .stages.flatMap((each) => each.jobs)
          .find((each) => each.id === 'ticket')!.task.steps[1]!,
      );
    // ACT
    const chat = review('simple');
    const cli = review('technical');
    // ASSERT
    expect(chat).toContain('The ticket is {{item}}');
    expect(cli).not.toContain('The ticket is');
  });
});

describe('edge cases', () => {
  it.each(LOCALES)(
    "leaves no unfilled marker in any prompt of any job but the slots and a round's item, in %s",
    (locale) => {
      // ARRANGE
      const { file: loaded } = workflowFor('project-plan', locale);
      const view = workflowView(workflowFor('project-plan', locale), { level: 'simple' });
      // ACT
      const left = view.stages.flatMap((each) => each.jobs).flatMap((job) => job.task.steps.map(joined));
      const unknown = left
        .flatMap((text) => text.match(/\{\{[^}]+\}\}/g) ?? [])
        .filter((marker) => marker !== '{{item}}');
      // ASSERT
      expect(loaded.stages).toHaveLength(view.stages.length);
      expect(unknown).toEqual([]);
    },
  );

  it('gives each epic and ticket example one entry per teaching round', () => {
    // ARRANGE
    const expected = { grill: 2, spec: 2, ticket: 4 };
    // ACT
    const counts = Object.fromEntries(
      Object.keys(expected).map((id) => [id, (task(id).details.example as string[]).length]),
    );
    // ASSERT
    expect(counts).toEqual(expected);
  });
});
