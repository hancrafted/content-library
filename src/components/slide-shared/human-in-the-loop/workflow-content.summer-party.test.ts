import { describe, expect, it } from 'vitest';
import { readTemplate } from './markdown-handoff.pure';
import summerPartyDe from './summer-party.de.yml';
import summerPartyEn from './summer-party.en.yml';
import vacationDe from './vacation.de.yml';
import vacationEn from './vacation.en.yml';
import { loadWorkflow } from './workflow-loader.pure';
import { tasksOf } from './workflow-outputs.pure';
import { slotSample } from './workflow-sample.pure';
import type { SectionDef, TaskDef, WorkflowFile } from './workflow-schema.types';

/*
 * The English summer-party in the new schema, held to the decisions of the grilling sessions of issue #279: seven
 * stages with their moves, tickets that are disjoint, samples that equal what the previous stage hands on, and
 * scenario facts kept out of the general instructions.
 */

function loaded(yaml: string = summerPartyEn): WorkflowFile {
  const result = loadWorkflow(yaml);
  if ('problems' in result) throw new Error(result.problems.join('\n'));
  return result.file;
}

const file = loaded();
const task = (id: string): TaskDef => {
  const found = tasksOf(file).find((each) => each.id === id);
  if (!found) throw new Error(`no task ${id}`);
  return found;
};
/** The one example of a task that has no fan-out. */
const exampleOf = (id: string): string => {
  const { example } = task(id).details;
  if (typeof example !== 'string') throw new Error(`task ${id} has one example per chat`);
  return example;
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

  it('gives Research three chats, and every task a review', () => {
    // ARRANGE
    const chats = 3;
    // ACT
    const unreviewed = tasksOf(file)
      .filter((each) => !each.review)
      .map((each) => each.id);
    // ASSERT
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
    const spec = exampleOf('spec');
    const tickets = exampleOf('tickets').split(/^## /m).slice(1);
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
      ['recommend', 'comparison', 'compare'],
    ] as const;
    // ACT
    const drift = pairs.filter(([taker, slot, maker]) => sampleOf(taker, slot) !== exampleOf(maker));
    // ASSERT
    expect(drift).toEqual([]);
  });

  it('ends each review on the same results it checks: every review sample of an earlier output equals that example', () => {
    // ARRANGE
    const own = [
      ['pieces', 'plan_result', 'pieces'],
      ['spec', 'spec', 'spec'],
      ['tickets', 'tickets', 'tickets'],
      ['compare', 'comparison_result', 'compare'],
      ['recommend', 'recommendation', 'recommend'],
    ] as const;
    // ACT
    const drift = own.filter(
      ([owner, slot, maker]) => task(owner).review?.slots.find((each) => each.id === slot)?.sample !== exampleOf(maker),
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
    expect(text).toMatch(/paste it back into the chat that did the work/);
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
    expect(slots).toEqual(['spec', 'research']);
  });

  it('gives Compare one multiple research slot whose three samples are the examples of Research chats 1 to 3', () => {
    // ARRANGE
    const research = task('compare').slots.find((slot) => slot.id === 'research');
    const examples = task('venue').details.example;
    const chats = 3;
    // ACT
    const review = task('compare').review?.slots.find((slot) => slot.id === 'research')?.sample;
    // ASSERT
    expect(research?.mode).toBe('multiple');
    expect(research?.sample).toEqual(examples);
    expect(review).toEqual(examples);
    expect(examples).toHaveLength(chats);
  });

  it('gives the three research examples three different venues of the three ticket types, differing in fit and price', () => {
    // ARRANGE
    const examples = [...task('venue').details.example];
    const chats = 3;
    const prices = examples.map((each) => /(\d+) euros with catering/.exec(each)?.[1]);
    // ACT
    const names = examples.map((each) => /^# (.+)$/m.exec(each)?.[1]);
    // ASSERT
    expect(new Set(names).size).toBe(chats);
    expect(new Set(prices).size).toBe(chats);
    expect(
      examples.map((each) =>
        /^(Event hall|Hotel|Outdoor)/m.test(each.split('## Fit against the requirements\n')[1] ?? ''),
      ),
    ).toEqual([true, true, true]);
  });

  it('keeps the venue names of Research in the comparison and the recommendation', () => {
    // ARRANGE
    const names = [...task('venue').details.example].map((each) => /^# (.+)$/m.exec(each)?.[1] ?? '');
    // ACT
    const missing = names.filter((name) => !exampleOf('compare').includes(name));
    // ASSERT
    expect(missing).toEqual([]);
    expect(exampleOf('recommend')).toContain(names[0]);
  });

  it('gives Plan a task slot whose sample is the summer party, and leaves no placeholder in any prompt', () => {
    // ARRANGE
    const slot = task('pieces').slots.find((each) => each.id === 'task');
    // ACT
    const texts = tasksOf(file).flatMap((each) =>
      [...each.do.simple, ...each.do.technical].map((section) => section.text),
    );
    // ASSERT
    expect(slot && slotSample(file, slot)).toMatch(/summer party/i);
    expect(texts.filter((text) => /<describe/.test(text))).toEqual([]);
  });
});

/** The four shipped files with the words that mark a scenario fact in their language. */
const SHIPPED = [
  [
    'summer-party en',
    summerPartyEn,
    /party|Frankfurt|venue|hall|hotel|guest|euro|€|June|catering|Mill|wheelchair|vegetarian/i,
  ],
  [
    'summer-party de',
    summerPartyDe,
    /Sommerfest|Frankfurt|Location|Halle|Hotel|Gäste|Euro|€|Juni|Catering|Mühle|Rollstuhl|vegetar/i,
  ],
  ['vacation en', vacationEn, /vacation|Algarve|September|hotel|beach|flight|apartment|week away|budget/i],
  ['vacation de', vacationDe, /Urlaub|Algarve|September|Hotel|Strand|Flug|Wohnung|Budget/i],
] as const;

/** The task that makes each slot's output, as the content tests pair them (task, slot, maker). */
const HANDS_ON = [
  ['interview', 'plan', 'pieces'],
  ['spec', 'interview', 'interview'],
  ['tickets', 'spec', 'spec'],
  ['venue', 'tickets', 'tickets'],
  ['compare', 'spec', 'spec'],
  ['recommend', 'comparison', 'compare'],
] as const;

describe.each(SHIPPED)('content defects of %s', (_name, yaml, facts) => {
  const shipped = loaded(yaml);
  const find = (id: string): TaskDef => {
    const found = tasksOf(shipped).find((each) => each.id === id);
    if (!found) throw new Error(`no task ${id}`);
    return found;
  };
  const sections = (): SectionDef[] => [
    ...shipped.reviewer.sections,
    ...tasksOf(shipped).flatMap((each) => [...each.do.simple, ...each.do.technical]),
  ];

  it('has no "technical background" wording in a technical prompt', () => {
    // ARRANGE
    const banned = /technical background|technischen Hintergrund/i;
    // ACT
    const found = tasksOf(shipped)
      .flatMap((each) => each.do.technical)
      .filter((section) => banned.test(`${section.heading}\n${section.text}`));
    // ASSERT
    expect(found).toEqual([]);
  });

  it('shows as a sample exactly what the previous stage hands on as its example', () => {
    // ARRANGE
    const sample = (taker: string, slot: string) => find(taker).slots.find((each) => each.id === slot)?.sample;
    // ACT
    const drift = HANDS_ON.filter(([taker, slot, maker]) => sample(taker, slot) !== find(maker).details.example);
    // ASSERT
    expect(drift).toEqual([]);
  });

  it('sends the fix handoff of every review back to the first chat, and the reviewer to the chat that did the work', () => {
    // ARRANGE
    const back = /first chat|ersten Chat/i;
    const report = shipped.reviewer.sections.find(
      (section) => section.purpose === 'scope' && /PASS|BESTANDEN/.test(section.text),
    );
    // ACT
    const reviews = tasksOf(shipped).flatMap((each) => (each.review ? [each.review] : []));
    const missing = reviews.filter((review) => !back.test(review.instructions ?? ''));
    // ASSERT
    expect(reviews.length).toBeGreaterThan(0);
    expect(missing).toEqual([]);
    expect(report?.text).toMatch(/chat that did the work|Chat zurück, der die Arbeit gemacht hat/);
  });

  it('keeps scenario facts out of every general instruction', () => {
    // ARRANGE
    const prose = sections().map((section) => `${section.heading}\n${section.text}`);
    // ACT
    const found = prose.filter((text) => facts.test(text));
    // ASSERT
    expect(found).toEqual([]);
  });
});
