import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import summerPartyEn from './summer-party.en.yml';
import {
  BUILT_IN_MARKERS,
  PURPOSES,
  REVIEWER_MARKERS,
  type SectionDef,
  type StageDef,
  type WorkflowFile,
} from './workflow-schema.types';

const proposal = parse(summerPartyEn) as WorkflowFile;
const RESEARCH = 4;

const markersOf = (sections: readonly SectionDef[]) =>
  sections.flatMap((section) => [...section.text.matchAll(/\{\{([^}]+)\}\}/g)].map((match) => match[1]));

describe('success cases', () => {
  it('reads as a WorkflowFile with a fan-out task, slots, a template and a review', () => {
    // ARRANGE
    const chats = 3;
    const stage: StageDef = proposal.stages[RESEARCH] as StageDef;
    // ACT
    const task = stage.tasks[0];
    // ASSERT
    expect(task.fanOut).toBe(chats);
    expect(task.slots.map((slot) => slot.id)).toEqual(['tickets']);
    expect(proposal.templates[task.template]).toContain('## Fit against the requirements');
    expect(task.review?.checks.length).toBeGreaterThan(0);
  });

  it('uses only known purposes and known markers, and keeps the scenario out of general instructions', () => {
    // ARRANGE
    const task = proposal.stages[RESEARCH].tasks[0];
    const slotIds = [...task.slots, ...(task.review?.slots ?? [])].map((slot) => slot.id);
    const known = new Set<string>([...BUILT_IN_MARKERS, ...slotIds]);
    const doSections = [...task.do.simple, ...task.do.technical];
    const reviewerKnown = new Set<string>([...known, ...REVIEWER_MARKERS]);
    // ACT
    const unknownDo = markersOf(doSections).filter((marker) => !known.has(marker));
    const unknownReviewer = markersOf(proposal.reviewer.sections).filter((marker) => !reviewerKnown.has(marker));
    const purposes = [...doSections, ...proposal.reviewer.sections].flatMap((s) => (s.purpose ? [s.purpose] : []));
    const prose = [...doSections, ...proposal.reviewer.sections].map((section) => section.text).join('\n');
    // ASSERT
    expect(unknownDo).toEqual([]);
    expect(unknownReviewer).toEqual([]);
    expect(purposes.every((purpose) => PURPOSES.includes(purpose))).toBe(true);
    expect(Object.keys(proposal.purposes).sort()).toEqual([...PURPOSES].sort());
    expect(prose).not.toMatch(/Frankfurt|venue|summer|200/i);
  });
});

describe('failure cases', () => {
  it('has a marker outside the known set when a section names a slot no task declares', () => {
    // ARRANGE
    const task = proposal.stages[RESEARCH].tasks[0];
    const known = new Set<string>([...BUILT_IN_MARKERS, ...task.slots.map((slot) => slot.id)]);
    const stray: SectionDef = { heading: 'Stray', text: '{{nowhere}}' };
    // ACT
    const unknown = markersOf([stray]).filter((marker) => !known.has(marker));
    // ASSERT
    expect(unknown).toEqual(['nowhere']);
  });
});

describe('edge cases', () => {
  it('lets a section go without a purpose, so it gets no marker', () => {
    // ARRANGE
    const bare: SectionDef = { heading: 'Bare', text: 'No purpose here.' };
    // ACT
    const purpose = bare.purpose;
    // ASSERT
    expect(purpose).toBeUndefined();
  });
});
