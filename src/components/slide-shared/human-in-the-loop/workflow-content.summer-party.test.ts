import { describe, expect, it } from 'vitest';
import { readTemplate } from './markdown-handoff.pure';
import summerPartyEn from './summer-party.en.yml';
import { loadWorkflow } from './workflow-loader.pure';
import { tasksOf } from './workflow-outputs.pure';
import type { SectionDef, TaskDef, WorkflowFile } from './workflow-schema.types';

/*
 * The English summer-party in the new schema, held to the decisions of the grilling sessions of issue #279: seven
 * stages with their moves, tickets that are disjoint, samples that equal what the previous stage hands on, and
 * scenario facts kept out of the general instructions.
 */

function loaded(): WorkflowFile {
  const result = loadWorkflow(summerPartyEn);
  if ('problems' in result) throw new Error(result.problems.join('\n'));
  return result.file;
}

const file = loaded();
const task = (id: string): TaskDef => {
  const found = tasksOf(file).find((each) => each.id === id);
  if (!found) throw new Error(`no task ${id}`);
  return found;
};
const sampleOf = (taskId: string, slotId: string) => task(taskId).slots.find((slot) => slot.id === slotId)?.sample;
const instructions = (): SectionDef[] => [
  ...file.reviewer.sections,
  ...tasksOf(file).flatMap((each) => [...each.do.simple, ...each.do.technical]),
];
const prose = (): string =>
  [
    ...instructions().map((section) => `${section.heading}\n${section.text}`),
    ...tasksOf(file).flatMap((each) => [
      each.details.why,
      ...each.details.goodLooksLike,
      ...(each.review?.checks ?? []),
    ]),
    ...file.stages.map((stage) => stage.learningGoal),
  ].join('\n');

describe('success cases', () => {
  it('has seven stages with the moves of the decisions', () => {
    // ARRANGE
    const expected = ['B', 'I', 'R', 'B', 'F', 'E', undefined];
    // ACT
    const moves = file.stages.map((stage) => stage.move);
    // ASSERT
    expect(file.stages.map((stage) => stage.id)).toEqual([
      'party',
      'interview',
      'requirements',
      'tickets',
      'research',
      'compare',
      'recommendation',
    ]);
    expect(moves).toEqual(expected);
  });

  it('gives Interview no review, Research three chats, and every other task a review', () => {
    // ARRANGE
    const chats = 3;
    const others = tasksOf(file).filter((each) => each.id !== 'interview');
    // ACT
    const unreviewed = others.filter((each) => !each.review).map((each) => each.id);
    // ASSERT
    expect(task('interview').review).toBeUndefined();
    expect(task('venue').fanOut).toBe(chats);
    expect(unreviewed).toEqual([]);
  });

  it('makes Requirements a spec only, without tickets', () => {
    // ARRANGE
    const headings = readTemplate(file.templates.spec ?? '').h2;
    // ACT
    const tickets = headings.filter((heading) => /ticket/i.test(heading));
    // ASSERT
    expect(tickets).toEqual([]);
  });

  it('makes Tickets one disjoint ticket per option to explore, each carrying every requirement', () => {
    // ARRANGE
    const bullets = (markdown: string, heading: string) =>
      (
        markdown
          .split(`## ${heading}\n`)[1]
          ?.split('## ')[0]
          ?.match(/^- .+$/gm) ?? []
      ).map((line) => line.slice(2));
    const spec = task('spec').details.example;
    const tickets = task('tickets').details.example.split(/^## /m).slice(1);
    // ACT
    const titles = tickets.map((section) => section.split('\n')[0]);
    const lacking = tickets.filter((section) =>
      bullets(spec, 'Requirements').some((need) => !section.includes(need.toLowerCase())),
    );
    // ASSERT
    expect(tickets).toHaveLength(bullets(spec, 'Options to explore').length);
    expect(new Set(titles).size).toBe(titles.length);
    expect(lacking).toEqual([]);
  });

  it('shows as a sample exactly what the previous stage hands on as its example', () => {
    // ARRANGE
    const pairs = [
      ['interview', 'plan', 'pieces'],
      ['spec', 'interview', 'interview'],
      ['tickets', 'spec', 'spec'],
      ['venue', 'tickets', 'tickets'],
      ['compare', 'spec', 'spec'],
      ['compare', 'research_1', 'venue'],
      ['recommend', 'comparison', 'compare'],
    ] as const;
    // ACT
    const drift = pairs.filter(([taker, slot, maker]) => sampleOf(taker, slot) !== task(maker).details.example);
    // ASSERT
    expect(drift).toEqual([]);
  });

  it('ends each review on the same results it checks: every review sample of an earlier output equals that example', () => {
    // ARRANGE
    const own = [
      ['pieces', 'plan_result', 'pieces'],
      ['spec', 'spec', 'spec'],
      ['tickets', 'tickets', 'tickets'],
      ['venue', 'research_result', 'venue'],
      ['compare', 'comparison_result', 'compare'],
      ['recommend', 'recommendation', 'recommend'],
    ] as const;
    // ACT
    const drift = own.filter(
      ([owner, slot, maker]) =>
        task(owner).review?.slots.find((each) => each.id === slot)?.sample !== task(maker).details.example,
    );
    // ASSERT
    expect(drift).toEqual([]);
  });

  it('has the reviewer send the fix handoff back to the chat that did the work', () => {
    // ARRANGE
    const report = file.reviewer.sections.find((section) => section.heading === 'Report');
    // ACT
    const text = report?.text ?? '';
    // ASSERT
    expect(text).toMatch(/paste back into the chat that did the work/);
  });
});

describe('failure cases', () => {
  it('keeps scenario facts out of every general instruction, check and explanation', () => {
    // ARRANGE
    const facts = /party|Frankfurt|venue|hall|hotel|guest|euro|€|June|catering|Mill|wheelchair|vegetarian/i;
    // ACT
    const found = prose().match(facts);
    // ASSERT
    expect(found).toBeNull();
  });

  it('has no Short variant, no page step and no technical-background wording', () => {
    // ARRANGE
    const banned = /\bshort (variant|version)|make it a page|HTML page|localhost|technical background/i;
    // ACT
    const found = prose().match(banned);
    // ASSERT
    expect(found).toBeNull();
  });
});

describe('edge cases', () => {
  it('lets Research chat n take ticket n and the Compare results come from chats 1 to 3', () => {
    // ARRANGE
    const simple = task('venue')
      .do.simple.map((section) => section.text)
      .join('\n');
    // ACT
    const slots = task('compare').slots.map((slot) => slot.id);
    // ASSERT
    expect(simple).toMatch(/ticket number \{\{n\}\}/);
    expect(slots).toEqual(['spec', 'research_1', 'research_2', 'research_3']);
  });

  it('gives the three research samples three different candidates', () => {
    // ARRANGE
    const samples = ['research_1', 'research_2', 'research_3'].map((id) => sampleOf('compare', id));
    // ACT
    const heads = samples.map((sample) => sample?.split('\n')[3]);
    // ASSERT
    expect(new Set(heads).size).toBe(samples.length);
  });
});
