import { describe, expect, it } from 'vitest';
import { WORKFLOW_IDS, workflowFor } from './workflow-data';
import { slotSample } from './workflow-sample.pure';
import type { SlotDef, TaskDef, WorkflowFile } from './workflow-schema.types';

/*
 * FE-012-shared-visual-content §1.3: both files of a pair hold the same structure and only the words differ. The
 * structure is the stage, task and slot ids, the slot modes and sample counts, the section count and purposes, the
 * fan-out and the example counts; strings are ignored.
 */

const fileOf = (id: (typeof WORKFLOW_IDS)[number], locale: 'en' | 'de'): WorkflowFile => {
  const { file } = workflowFor(id, locale);
  if (!file) throw new Error(`${id} (${locale}) has no file`);
  return file;
};

const count = (value: string | readonly string[] | undefined): number | undefined =>
  value === undefined ? undefined : typeof value === 'string' ? 1 : value.length;

const slotShape = (slot: SlotDef) => [slot.id, slot.mode, slot.free ?? false, count(slot.sample)];
const taskShape = (task: TaskDef) => ({
  id: task.id,
  output: task.output,
  template: task.template,
  fanOut: task.fanOut,
  slots: task.slots.map(slotShape),
  simple: task.do.simple.map((section) => section.purpose),
  technical: task.do.technical.map((section) => section.purpose),
  instructions: Boolean(task.instructions),
  review: task.review && {
    instructions: Boolean(task.review.instructions),
    slots: task.review.slots.map(slotShape),
    checks: task.review.checks.length,
  },
  examples: count(task.details.example),
  good: task.details.goodLooksLike.length,
});

/** What must match across the pair. */
const structureOf = (file: WorkflowFile) => ({
  id: file.id,
  facts: file.scenario.facts.length,
  purposes: Object.keys(file.purposes),
  reviewer: file.reviewer.sections.map((section) => section.purpose),
  templates: Object.keys(file.templates),
  stages: file.stages.map((stage) => ({
    id: stage.id,
    move: stage.move,
    gate: stage.gate,
    card: stage.card?.lines.length,
    tasks: stage.tasks.map(taskShape),
  })),
});

describe('success cases', () => {
  it.each(EACH)('gives Compare one research slot of the three Research examples, in %s %s', (id, locale) => {
    // ARRANGE
    const file = fileOf(id, locale);
    const chats = 3;
    // ACT
    const compare = taskOf(file, 'compare');
    const research = compare.slots.find((slot) => slot.id === 'research');
    // ASSERT
    expect(research?.mode).toBe('multiple');
    expect(research?.sample).toEqual(taskOf(file, 'venue').details.example);
    expect(taskOf(file, 'venue').details.example).toHaveLength(chats);
  });

  it.each(EACH)('gives Plan a task slot with a sample and no placeholder, in %s %s', (id, locale) => {
    // ARRANGE
    const pieces = taskOf(fileOf(id, locale), 'pieces');
    // ACT
    const slot = pieces.slots.find((each) => each.id === 'task');
    const texts = [...pieces.do.simple, ...pieces.do.technical].map((section) => section.text);
    // ASSERT
    expect(slot && slotSample(fileOf(id, locale), slot)).toBeTruthy();
    expect(slot?.sample).toBeUndefined();
    expect(texts.filter((text) => /<.*>/.test(text))).toEqual([]);
  });
  it.each(EACH)('gives every do and review step instructions of one or two sentences, in %s %s', (id, locale) => {
    // ARRANGE
    const tasks = fileOf(id, locale).stages.flatMap((stage) => stage.tasks);
    // ACT
    const texts = tasks.flatMap((task) => [task.instructions, task.review?.instructions]);
    const longest = 2;
    const steps = tasks.length + tasks.filter((task) => task.review).length;
    // ASSERT
    expect(texts.filter((text) => text !== undefined)).toHaveLength(steps);
    expect(texts.every((text) => text === undefined || (text.match(/[.!?](\s|$)/g) ?? []).length <= longest)).toBe(
      true,
    );
  });

  it.each(WORKFLOW_IDS)('holds the same structure in English and German for %s', (id) => {
    // ARRANGE
    const en = structureOf(fileOf(id, 'en'));
    // ACT
    const de = structureOf(fileOf(id, 'de'));
    // ASSERT
    expect(de).toEqual(en);
  });
});

const EACH = WORKFLOW_IDS.flatMap((id) => (['en', 'de'] as const).map((locale) => [id, locale] as const));
const taskOf = (file: WorkflowFile, id: string): TaskDef => {
  const found = file.stages.flatMap((stage) => stage.tasks).find((each) => each.id === id);
  if (!found) throw new Error(`no task ${id}`);
  return found;
};

describe('failure cases', () => {
  it('reads a difference of structure: a stage with one task fewer is not the same pair', () => {
    // ARRANGE
    const en = fileOf('summer-party', 'en');
    const fewer = { ...en, stages: en.stages.map((stage, at) => (at === 0 ? { ...stage, tasks: [] } : stage)) };
    // ACT
    const same = JSON.stringify(structureOf(fewer)) === JSON.stringify(structureOf(en));
    // ASSERT
    expect(same).toBe(false);
  });
});

describe('edge cases', () => {
  it.each(WORKFLOW_IDS)('writes the German file in German: no German string equals its English one in %s', (id) => {
    // ARRANGE
    const en = fileOf(id, 'en');
    const de = fileOf(id, 'de');
    // ACT
    const same = de.stages.filter((stage, at) => stage.learningGoal === en.stages[at]?.learningGoal);
    // ASSERT
    expect(same).toEqual([]);
  });
});
