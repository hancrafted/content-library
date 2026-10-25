import { describe, expect, it } from 'vitest';
import { loadContentStore, type RawContent } from './content-store.pure';

/*
 * Research questions through the content store (design-ADR 0016, Citations rules 1 to 5): the id comes from the
 * folder, unique across the wiki and Staging; `confidence` is one of three values; `informs` names Concepts that
 * exist, the first the main one.
 */

const WIKI = 'docs/llm-wiki/research';
const STAGED = 'docs/episodes/never-too-early-sales/research';

interface ResearchFields {
  readonly confidence?: string | null;
  readonly informs?: readonly string[] | null;
  readonly reason?: string | null;
  readonly extra?: readonly string[];
}

/** One frontmatter line, or none when the field is left out (`null`). */
function line(value: string | null, write: (value: string) => string): string[] {
  return value === null ? [] : [write(value)];
}

function research(folder: string, fields: ResearchFields = {}) {
  const { confidence = 'open', informs = ['sales'], reason = 'Source [1] alone, so open.' } = fields;
  return {
    path: `${folder}/research.md`,
    markdown: [
      '---',
      'type: research',
      "title: 'Why does it happen?'",
      "description: 'Because it does.'",
      ...line(confidence, (value) => `confidence: ${value}`),
      ...line(informs === null ? null : informs.join(', '), (value) => `informs: [${value}]`),
      ...line(reason, (value) => `confidence_reason: '${value}'`),
      ...(fields.extra ?? []),
      'generated:',
      '  by: claude-code/opus-5.5',
      '  at: 2026-10-13T00:00:00Z',
      'sources:',
      '  - id: 1',
      '    resource: https://a.example/x',
      "    title: 'A'",
      '---',
      '',
      '# Why does it happen?',
      '',
      '## Answer',
      '',
      'It does [1].',
      '',
      "[1]: https://a.example/x 'A'",
    ].join('\n'),
  };
}

function concept(id: string) {
  return {
    path: `docs/llm-wiki/concepts/${id}/concept.md`,
    markdown: [
      '---',
      'type: concept',
      `title: '${id}'`,
      `description: 'What ${id} scopes.'`,
      'broader: []',
      'generated:',
      '  by: claude-code/opus-5.5',
      '  at: 2026-10-25T00:00:00Z',
      '---',
      '',
      `${id} is defined here.`,
    ].join('\n'),
  };
}

const SALES_0001 = `${WIKI}/SALES/SALES-0001__b2b-sales-cycle-length`;
const VALID: RawContent = {
  themes: { sales: { icon: 'handshake', accent: 'emerald' }, 'ai-cost': { icon: 'coins', accent: 'amber' } },
  concepts: [concept('sales'), concept('ai-cost')],
  episodes: [],
  events: [],
  playlists: [],
  research: [research(SALES_0001)],
  slideSources: [],
  sourceBaseline: [],
  slides: [],
  episodeSlides: [],
  definitionSlides: [],
  researchPlans: [],
};

/** A research plan in the Staging that holds `folder`, listing a refresh of the wiki question it shadows. */
function refreshPlan(staging: string, folder: string, stale: string) {
  return {
    path: `${staging}/research-plan.md`,
    markdown: `# Research plan\n\n## Research jobs\n\n- refresh: ${folder}, question 1, refreshes ${stale}.\n`,
  };
}

function refusalsOf(raw: RawContent) {
  const result = loadContentStore(raw);
  return result.ok ? [] : result.refusals.map(({ kind, record, message }) => ({ kind, record, message }));
}

describe('success cases', () => {
  it('A new Research question is proposed with a confidence and the Concepts it informs: it loads as a proposal with its reason', () => {
    // ARRANGE
    const staged = `${STAGED}/SALES-0007__staged-question`;
    const raw = {
      ...VALID,
      research: [research(staged, { confidence: 'open', reason: 'One vendor survey [1], so open.' })],
    };
    const expected = {
      id: 'SALES-0007',
      staged: true,
      confirmed: false,
      confidence: 'open',
      confidence_reason: 'One vendor survey [1], so open.',
      informs: ['sales'],
    };
    // ACT
    const result = loadContentStore(raw);
    // ASSERT
    expect(result.ok ? result.store.research[0] : result.refusals).toMatchObject(expected);
  });

  it('loads a Research question with its confidence and the Concepts it informs, the main one first', () => {
    // ARRANGE
    const raw = {
      ...VALID,
      research: [research(SALES_0001, { confidence: 'contested', informs: ['sales', 'ai-cost'] })],
    };
    const expected = { id: 'SALES-0001', confidence: 'contested', informs: ['sales', 'ai-cost'] };
    // ACT
    const result = loadContentStore(raw);
    // ASSERT
    expect(result.ok && result.store.research[0]).toMatchObject(expected);
  });
});

describe('failure cases', () => {
  it.each([
    ['no confidence', { confidence: null }, /^confidence: /],
    ['no Concepts it informs', { informs: null }, /^informs: /],
    ['no line on which Sources earn the confidence', { reason: null }, /^confidence_reason: /],
  ])(
    'A new Research question is proposed with a confidence and the Concepts it informs; one without either fails: %s',
    (_, fields, message) => {
      // ARRANGE
      const staged = `${STAGED}/SALES-0007__staged-question`;
      const raw = { ...VALID, research: [research(SALES_0001), research(staged, fields)] };
      const expected = { kind: 'research', record: `${staged}/research.md` };
      // ACT
      const refusals = refusalsOf(raw);
      // ASSERT
      expect(refusals).toHaveLength(1);
      expect(refusals[0]).toMatchObject(expected);
      expect(refusals[0].message).toMatch(message);
    },
  );

  it.each([
    ['no confidence', null],
    ['confidence probable', 'probable'],
  ])(
    'A Research question with no confidence, or one that is not settled, contested or open, fails: %s',
    (_, confidence) => {
      // ARRANGE
      const raw = { ...VALID, research: [research(SALES_0001, { confidence })] };
      const expected = { kind: 'research', record: `${SALES_0001}/research.md` };
      // ACT
      const refusals = refusalsOf(raw);
      // ASSERT
      expect(refusals).toHaveLength(1);
      expect(refusals[0]).toMatchObject(expected);
      expect(refusals[0].message).toMatch(/^confidence: /);
    },
  );

  it.each([
    ['informs no Concept', null, /^informs: /],
    ['informs an empty list', [], /^informs: names no Concept/],
  ])(
    'A Research question that informs no Concept, or a Concept that does not exist, fails: %s',
    (_, informs, message) => {
      // ARRANGE
      const raw = { ...VALID, research: [research(SALES_0001, { informs })] };
      const expected = { kind: 'research', record: `${SALES_0001}/research.md` };
      // ACT
      const refusals = refusalsOf(raw);
      // ASSERT
      expect(refusals).toHaveLength(1);
      expect(refusals[0]).toMatchObject(expected);
      expect(refusals[0].message).toMatch(message);
    },
  );

  it('A Research question that informs no Concept, or a Concept that does not exist, fails: a Concept that does not exist', () => {
    // ARRANGE
    const raw = { ...VALID, research: [research(SALES_0001, { informs: ['sales', 'pricing'] })] };
    const expected = [
      { kind: 'research', record: 'SALES-0001', message: 'informs names pricing, which is no Concept' },
    ];
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toEqual(expected);
  });

  it.each([
    ['a malformed id', [research(`${STAGED}/SALES-01__short-number`)], `${STAGED}/SALES-01__short-number/research.md`],
    [
      'a duplicate id across wiki and Staging',
      [research(SALES_0001), research(`${STAGED}/SALES-0001__another-question`)],
      'SALES-0001',
    ],
  ])('A malformed or duplicate Research question id across wiki and Staging fails: %s', (_, files, record) => {
    // ARRANGE
    const raw = { ...VALID, research: files };
    const expected = { kind: 'research', record };
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toHaveLength(1);
    expect(refusals[0]).toMatchObject(expected);
  });
});

describe('edge cases', () => {
  it('A refreshed question keeps its id, and the notes that cited it still resolve', () => {
    // ARRANGE
    const refreshed = `${STAGED}/SALES-0001__b2b-sales-cycle-length`;
    const raw = {
      ...VALID,
      research: [research(SALES_0001), research(refreshed, { confidence: 'open' })],
      researchPlans: [
        refreshPlan('docs/episodes/never-too-early-sales', 'SALES-0001__b2b-sales-cycle-length', 'SALES-0001'),
      ],
    };
    const expected = [
      { id: 'SALES-0001', staged: false },
      { id: 'SALES-0001', staged: true },
    ];
    // ACT
    const result = loadContentStore(raw);
    // ASSERT
    expect(result.ok ? result.store.research.map(({ id, staged }) => ({ id, staged })) : result.refusals).toEqual(
      expected,
    );
  });

  it('refuses a staged question that shadows a wiki id when its plan lists no refresh of that id', () => {
    // ARRANGE
    const shadow = `${STAGED}/SALES-0001__b2b-sales-cycle-length`;
    const raw = {
      ...VALID,
      research: [research(SALES_0001), research(shadow)],
      researchPlans: [refreshPlan('docs/episodes/never-too-early-sales', 'SALES-0002__another-question', 'SALES-0002')],
    };
    const expected = [
      { kind: 'research', record: 'SALES-0001', message: 'the id is used by more than one research file' },
    ];
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toEqual(expected);
  });

  it('A merge re-points every citation and the retired id can never be reused: a file under a retired id fails', () => {
    // ARRANGE
    const raw = {
      ...VALID,
      research: [
        research(SALES_0001, { extra: ['supersedes: [SALES-0002]'] }),
        research(`${STAGED}/SALES-0002__sales-cycle-drivers`),
      ],
    };
    const expected = [
      {
        kind: 'research',
        record: 'SALES-0002',
        message: 'the id was retired into SALES-0001 by a merge and is never reused; take the next free number',
      },
    ];
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toEqual(expected);
  });

  it('takes a staged Research question id from its folder and tells it apart from a wiki one', () => {
    // ARRANGE
    const raw = { ...VALID, research: [research(SALES_0001), research(`${STAGED}/SALES-0007__staged-question`)] };
    const expected = [
      { id: 'SALES-0001', staged: false },
      { id: 'SALES-0007', staged: true },
    ];
    // ACT
    const result = loadContentStore(raw);
    // ASSERT
    expect(result.ok && result.store.research.map(({ id, staged }) => ({ id, staged }))).toEqual(expected);
  });

  it('holds confidence and informs as a proposal until Han verifies the file at or after it was written', () => {
    // ARRANGE
    const verifiedBy = (by: string, at: string) => ['verified:', `  - by: ${by}`, `    at: ${at}`];
    const raw = {
      ...VALID,
      research: [
        research(`${WIKI}/SALES/SALES-0001__proposed`),
        research(`${WIKI}/SALES/SALES-0002__confirmed`, { extra: verifiedBy('human:han', '2026-10-14T00:00:00Z') }),
        research(`${WIKI}/SALES/SALES-0003__rerun-since`, { extra: verifiedBy('human:han', '2026-10-01T00:00:00Z') }),
        research(`${WIKI}/SALES/SALES-0004__by-a-machine`, {
          extra: verifiedBy('process:markdown-harness', '2026-10-14T00:00:00Z'),
        }),
      ],
    };
    const expected = [false, true, false, false];
    // ACT
    const result = loadContentStore(raw);
    // ASSERT
    expect(result.ok && result.store.research.map(({ confirmed }) => confirmed)).toEqual(expected);
  });
});
