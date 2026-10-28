import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import {
  BUILT_IN_MARKERS,
  PURPOSES,
  REVIEWER_MARKERS,
  type SectionDef,
  type StageDef,
  type WorkflowFile,
} from './workflow-schema.types';
import fixtureEn from './workflow.fixture.en.yml';

const proposal = parse(fixtureEn) as WorkflowFile;
const EACH = 1;
const ASK = 0;

const markersOf = (sections: readonly SectionDef[]) =>
  sections.flatMap((section) => [...section.text.matchAll(/\{\{([^}]+)\}\}/g)].map((match) => match[1]));

describe('success cases', () => {
  it('reads as a WorkflowFile with a repeated stage, slots, a template and a review', () => {
    // ARRANGE
    const chats = 2;
    const heading = '## Finding';
    const stage: StageDef = proposal.stages[EACH] as StageDef;
    const ask = proposal.stages[ASK]?.jobs.find((job) => job.id === 'ask');
    // ACT
    const task = stage.jobs[0];
    // ASSERT
    expect(stage.foreach?.demo).toBe(chats);
    expect(task.slots.map((slot) => slot.id)).toEqual(['brief']);
    expect(proposal.templates[task.template]).toContain(heading);
    expect(ask?.review?.checks.length).toBeGreaterThan(0);
  });

  it('uses only known purposes and known markers, and keeps the scenario out of general instructions', () => {
    // ARRANGE
    const task = proposal.stages[EACH].jobs[0];
    const slotIds = [...task.slots, ...(task.review?.slots ?? [])].map((slot) => slot.id);
    const known = new Set<string>([...BUILT_IN_MARKERS, ...slotIds]);
    const doSections = [...task.do.simple, ...task.do.technical];
    const reviewerKnown = new Set<string>([...known, ...REVIEWER_MARKERS]);
    // ACT
    const unknownDo = markersOf(doSections).filter((marker) => !known.has(marker));
    const unknownReviewer = markersOf(proposal.reviewer.sections).filter((marker) => !reviewerKnown.has(marker));
    const purposes = [...doSections, ...proposal.reviewer.sections].flatMap((s) => (s.purpose ? [s.purpose] : []));
    const prose = [...doSections, ...proposal.reviewer.sections].map((section) => section.text).join('\n');
    const scenarioFact = proposal.scenario.facts[0] ?? '';
    // ASSERT
    expect(unknownDo).toEqual([]);
    expect(unknownReviewer).toEqual([]);
    expect(purposes.every((purpose) => PURPOSES.includes(purpose))).toBe(true);
    expect(Object.keys(proposal.purposes).sort()).toEqual([...PURPOSES].sort());
    expect(prose).not.toContain(scenarioFact);
  });
});

describe('failure cases', () => {
  it('has a marker outside the known set when a section names a slot no task declares', () => {
    // ARRANGE
    const task = proposal.stages[EACH].jobs[0];
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
