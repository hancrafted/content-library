import { describe, expect, it } from 'vitest';
import { handFixSection, type HandFix } from './hand-fixes.pure.ts';

const SKILL_FILE = 'skills/new-episode/references/write-research.md';
const ISSUE = 'https://github.com/hancrafted/content-library/issues/321';

function fix(subject: string, feeds: string | null): HandFix {
  return { hash: 'a1b2c3d4e5f6', subject, feeds, files: ['src/components/episodes/demo/b.tsx'] };
}

describe('handFixSection', () => {
  describe('success cases', () => {
    it('shows a hand fix that feeds a skill file as a change to that file', () => {
      // ARRANGE
      const fixes = [fix('fix(demo): the cashflow label', SKILL_FILE)];
      const expected = {
        id: 'F1',
        title: 'Put the lesson of the fix "the cashflow label" into the file its commit names.',
        weight: 'strong',
        changes: SKILL_FILE,
        happened: 'You fixed "the cashflow label" by hand. The commit says the lesson belongs in this file.',
        change: 'The pipeline-feedback skill writes the lesson into the file named under the title.',
        gain: 'The next Run gets this right without a hand fix.',
        before: {
          kind: 'flow',
          nodes: [{ label: 'the Run writes it wrong', tone: 'bad' }, { label: 'you fix it by hand' }],
        },
        after: {
          kind: 'flow',
          nodes: [{ label: 'that file teaches it' }, { label: 'the Run writes it right', tone: 'good' }],
        },
        evidence: 'a1b2c3d4 fix(demo): the cashflow label · src/components/episodes/demo/b.tsx',
      };
      // ACT
      const [card] = handFixSection(fixes).cards;
      // ASSERT
      expect(card).toEqual(expected);
    });

    it('shows a hand fix that feeds an issue with the issue', () => {
      // ARRANGE
      const fixes = [fix('fix(pool): the axis title', ISSUE)];
      const expected = {
        title: 'Keep the issue that holds the lesson of the fix "the axis title".',
        change: `The issue ${ISSUE} names the change to make; the pipeline-feedback skill lands it.`,
      };
      // ACT
      const [{ title, change }] = handFixSection(fixes).cards;
      // ASSERT
      expect({ title, change }).toEqual(expected);
    });

    it('A none: <reason> fix is listed so Han can contest it', () => {
      // ARRANGE
      const fixes = [fix('fix(wiki): a date', 'none: a one-off typo')];
      const expected = {
        title: 'Agree that the fix "a date" teaches the pipeline nothing.',
        happened: 'You fixed "a date" by hand. The commit says no process could have caught it: a one-off typo.',
        change:
          'Keep the card to agree. Strike it to contest the reason, and name in its note the file that should have caught it.',
      };
      // ACT
      const [{ title, happened, change }] = handFixSection(fixes).cards;
      // ASSERT
      expect({ title, happened, change }).toEqual(expected);
    });
  });

  describe('failure cases', () => {
    it('asks where a hand fix with no Feeds line feeds back', () => {
      // ARRANGE
      const fixes = [fix('fix(demo): the label', null)];
      const expected = {
        title: 'Name the file that should have caught the fix "the label".',
        happened: 'You fixed "the label" by hand, and the commit says nowhere the lesson goes.',
      };
      // ACT
      const [{ title, happened }] = handFixSection(fixes).cards;
      // ASSERT
      expect({ title, happened }).toEqual(expected);
    });
  });

  describe('edge cases', () => {
    it('names a Feeds file that carries a rule id only where the report allows it', () => {
      // ARRANGE
      const adr = '.archgate/adrs/FE-008-page-metadata.md';
      const fixes = [fix('fix(seo): the title', adr)];
      const expected = adr;
      // ACT
      const [card] = handFixSection(fixes).cards;
      const face = [card.title, card.happened, card.change, card.gain].join(' ');
      // ASSERT
      expect(card.changes).toBe(expected);
      expect(face).not.toContain(expected);
    });

    it('says a rule id in the commit plainly, so the Harvest report draws the card, and keeps the subject as evidence', () => {
      // ARRANGE
      const fixes = [fix('fix(seo): make FE-008 §6 a rule', 'none: a one-off')];
      const expected = {
        title: 'Agree that the fix "make a rule a section a rule" teaches the pipeline nothing.',
        evidence: 'a1b2c3d4 fix(seo): make FE-008 §6 a rule · src/components/episodes/demo/b.tsx',
      };
      // ACT
      const [{ title, evidence }] = handFixSection(fixes).cards;
      // ASSERT
      expect({ title, evidence }).toEqual(expected);
    });

    it('numbers the cards in commit order and has none for a Run with no hand fix', () => {
      // ARRANGE
      const fixes = [fix('fix: one', SKILL_FILE), fix('fix(x)!: two', ISSUE)];
      const expected = ['F1', 'F2'];
      // ACT
      const ids = handFixSection(fixes).cards.map(({ id }) => id);
      const none = handFixSection([]).cards;
      // ASSERT
      expect(ids).toEqual(expected);
      expect(none).toEqual([]);
    });
  });
});
