import { load } from 'cheerio';
import { describe, expect, it } from 'vitest';
import { harvestReport, type Harvest } from './harvest-report.pure.ts';

const TEMPLATE = `<!doctype html><html><head><script type="application/json" id="harvest">
{ "example": true }
</script></head><body><script>/* render */</script></body></html>`;

function harvest(): Harvest {
  return {
    staging: 'docs/episodes/cash-first-run-2',
    episode: 'Cash first',
    sections: [
      {
        key: 'lessons',
        title: 'Lessons',
        target: 'skills/new-episode/LEARNINGS.md',
        cards: [
          {
            id: 'L1',
            title: 'Key Scene text off notes.*',
            happened: 'Builders renamed the text keys on three Slides.',
            change: 'Designers name text keys after what they show.',
            gain: 'Slides build as drawn.',
            before: { kind: 'flow', nodes: [{ label: 'notes.*', tone: 'bad' }] },
            after: { kind: 'quote', text: 'board.*' },
            overlaps: ['T1'],
          },
        ],
      },
      {
        key: 'tickets',
        title: 'Refactor tickets',
        target: 'gh issue create --label needs-triage',
        cards: [
          {
            id: 'T1',
            title: 'Build shared parts first',
            happened: 'Three Sections waited on one shared drawing.',
            change: 'One Job builds shared drawings first.',
            gain: 'Sections build in parallel.',
            before: { kind: 'count', value: 3, unit: 'parallel authors' },
            after: { kind: 'stack', items: [{ label: 'slide-shared/x', tone: 'good' }] },
          },
        ],
      },
    ],
  };
}

describe('harvestReport', () => {
  describe('success cases', () => {
    it("puts the harvest in the template's data block and keeps the render script", () => {
      // ARRANGE
      const input = harvest();
      const render = '/* render */';

      // ACT
      const $ = load(harvestReport(TEMPLATE, input));
      const embedded: unknown = JSON.parse($('#harvest').text());

      // ASSERT
      expect(embedded).toEqual(input);
      expect($('body script').text()).toBe(render);
    });
  });

  describe('failure cases', () => {
    it('refuses a card id used twice, an overlap naming no card and a visual kind the page cannot draw', () => {
      // ARRANGE
      const input = harvest();
      const [lessons, tickets] = input.sections;
      if (!lessons?.cards[0] || !tickets?.cards[0]) throw new Error('fixture');
      tickets.cards[0].id = 'L1';
      lessons.cards[0].after = { kind: 'chart' } as unknown as Harvest['sections'][number]['cards'][number]['after'];
      const problems = [/L1 is used twice/, /L1 overlaps T1, which is no card/, /L1 after: no visual kind "chart"/];

      // ACT
      const report = () => harvestReport(TEMPLATE, input);

      // ASSERT
      for (const problem of problems) expect(report).toThrow(problem);
    });

    it('refuses rule ids and section signs in the words the user decides on, and allows them in the evidence', () => {
      // ARRANGE
      const input = harvest();
      const card = input.sections[0]?.cards[0];
      if (!card) throw new Error('fixture');
      card.title = 'Fix the FE-010 keys';
      card.change = 'Follow ARCH-003 §3.2.';
      card.evidence = 'Score fail FE-010 §3.1';
      const problems = [
        /L1 title: "FE-010" is jargon/,
        /L1 change: "ARCH-003" is jargon/,
        /L1 change: "§3.2" is jargon/,
      ];

      // ACT
      const report = () => harvestReport(TEMPLATE, input);

      // ASSERT
      for (const problem of problems) expect(report).toThrow(problem);
      expect(report).not.toThrow(/L1 evidence/);
    });
  });

  describe('edge cases', () => {
    it('escapes a closing script tag in the data so the page still parses', () => {
      // ARRANGE
      const input = harvest();
      const title = 'Drop the </script> in a comment';
      const card = input.sections[0]?.cards[0];
      if (!card) throw new Error('fixture');
      card.title = title;

      // ACT
      const $ = load(harvestReport(TEMPLATE, input));
      const embedded = JSON.parse($('#harvest').text()) as Harvest;

      // ASSERT
      expect(embedded.sections[0]?.cards[0]?.title).toBe(title);
      expect($('body script').length).toBe(1);
    });
  });
});
