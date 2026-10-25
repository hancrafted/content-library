import { describe, expect, it } from 'vitest';
import { loadContentStore, type RawContent } from './content-store.pure';

/*
 * Concepts through the content store: a Concept is one markdown file whose folder is its id; the store refuses a
 * broken hierarchy, a theme on a child and a written `narrower`, and themes each Episode card from the Concept its
 * metadata names in `applyThemeFromConcept`.
 */

interface ConceptFields {
  readonly title?: string;
  readonly broader?: readonly string[];
  readonly related?: readonly string[];
  readonly extra?: readonly string[];
}

function concept(id: string, fields: ConceptFields = {}) {
  const list = (ids: readonly string[]) => `[${ids.join(', ')}]`;
  return {
    path: `docs/llm-wiki/concepts/${id}/concept.md`,
    markdown: [
      '---',
      'type: concept',
      `title: '${fields.title ?? id}'`,
      `description: 'What ${id} scopes.'`,
      `broader: ${list(fields.broader ?? [])}`,
      ...(fields.related ? [`related: ${list(fields.related)}`] : []),
      ...(fields.extra ?? []),
      'generated:',
      '  by: claude-code/opus-5.5',
      '  at: 2026-10-25T00:00:00Z',
      '---',
      '',
      `${id} is defined here.`,
    ].join('\n'),
  };
}

const EPISODE = {
  slug: 'never-too-early-sales',
  status: 'published',
  format: 'foundations',
  concepts: ['sales'],
  applyThemeFromConcept: 'sales',
  publishedOn: '2026-10-19',
};

const VALID: RawContent = {
  themes: {
    sales: { icon: 'handshake', accent: 'emerald' },
    'ai-cost': { icon: 'coins', accent: 'amber' },
  },
  concepts: [concept('sales'), concept('ai-cost'), concept('startup-cash-flow', { broader: ['sales'] })],
  episodes: [EPISODE],
  workshops: [],
  research: [],
  slideSources: [],
  definitionSlides: [],
};

function refusalsOf(raw: RawContent) {
  const result = loadContentStore(raw);
  return result.ok ? [] : result.refusals;
}

describe('success cases', () => {
  it('loads every Concept by the id its folder gives it', () => {
    // ARRANGE
    const expected = ['sales', 'ai-cost', 'startup-cash-flow'];
    // ACT
    const result = loadContentStore(VALID);
    // ASSERT
    expect(result.ok && result.store.concepts.map(({ id }) => id)).toEqual(expected);
  });

  it('derives narrower from every broader that names a Concept', () => {
    // ARRANGE
    const expected = ['startup-cash-flow'];
    // ACT
    const result = loadContentStore(VALID);
    // ASSERT
    expect(result.ok && result.store.concepts.find(({ id }) => id === 'sales')?.narrower).toEqual(expected);
  });

  it('mirrors related, stored on one side only, onto the other', () => {
    // ARRANGE
    const raw = { ...VALID, concepts: [concept('sales', { related: ['ai-cost'] }), concept('ai-cost')] };
    const expected = ['sales'];
    // ACT
    const result = loadContentStore(raw);
    // ASSERT
    expect(result.ok && result.store.concepts.find(({ id }) => id === 'ai-cost')?.related).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('A Concept that names a missing parent fails', () => {
    // ARRANGE
    const raw = { ...VALID, concepts: [...VALID.concepts, concept('pricing', { broader: ['revenue'] })] };
    const expected = [{ kind: 'concept', record: 'pricing', message: 'broader names revenue, which is no Concept' }];
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toEqual(expected);
  });

  it('A cycle in broader fails', () => {
    // ARRANGE
    const raw = {
      ...VALID,
      concepts: [
        ...VALID.concepts,
        concept('pricing', { broader: ['margin'] }),
        concept('margin', { broader: ['pricing'] }),
      ],
    };
    const expected = ['pricing', 'margin'];
    // ACT
    const refusals = refusalsOf(raw).filter(({ message }) => message.includes('cycle'));
    // ASSERT
    expect(refusals.map(({ record }) => record)).toEqual(expected);
  });

  it('A Concept with a parent carries no theme', () => {
    // ARRANGE
    const themes = { ...(VALID.themes as object), 'startup-cash-flow': { icon: 'coins', accent: 'amber' } };
    const raw = { ...VALID, themes };
    const expected = [
      { kind: 'theme', record: 'startup-cash-flow', message: 'a Concept with a parent carries no theme' },
    ];
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toEqual(expected);
  });

  it('Writing narrower in a Concept file fails', () => {
    // ARRANGE
    const written = concept('sales', { extra: ['narrower: [startup-cash-flow]'] });
    const raw = { ...VALID, concepts: [written, ...VALID.concepts.slice(1)] };
    const expected = {
      kind: 'concept',
      record: written.path,
      message: 'narrower is derived from every broader that names this Concept; do not write it',
    };
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toContainEqual(expected);
  });

  it('Every Episode names a top Concept as its theme, and one outside the seven fails', () => {
    // ARRANGE
    const raw = {
      ...VALID,
      episodes: [{ ...EPISODE, concepts: ['sales', 'workflow'], applyThemeFromConcept: 'workflow' }],
    };
    const expected = [
      'never-too-early-sales: applyThemeFromConcept names workflow, which is not one of the top Concepts',
      'never-too-early-sales: concepts names workflow, which is not one of the top Concepts',
    ];
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals.map(({ message }) => message)).toEqual(expected);
  });

  it('A Definition Slide whose defines names no Concept fails', () => {
    // ARRANGE
    const slide = { episode: 'never-too-early-sales', slide: 'why-it-takes-time', defines: 'sales-cycle' };
    const raw = { ...VALID, definitionSlides: [slide] };
    const expected = [
      {
        kind: 'definition-slide',
        record: 'never-too-early-sales/why-it-takes-time',
        message: 'defines names sales-cycle, which is no Concept',
      },
    ];
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('refuses a top Concept that has no theme, since a new theme is a design decision', () => {
    // ARRANGE
    const raw = { ...VALID, concepts: [...VALID.concepts, concept('llm-behaviour')] };
    const expected = [
      {
        kind: 'concept',
        record: 'llm-behaviour',
        message: 'a top Concept needs a theme: a new top Concept is a design decision, not a content edit',
      },
    ];
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toEqual(expected);
  });

  it('refuses an Episode theme that its own concepts do not list', () => {
    // ARRANGE
    const raw = { ...VALID, episodes: [{ ...EPISODE, concepts: ['ai-cost'], applyThemeFromConcept: 'sales' }] };
    const expected = ['never-too-early-sales: applyThemeFromConcept names sales, which concepts does not list'];
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals.map(({ message }) => message)).toEqual(expected);
  });

  it('refuses a Concept folder whose name is not a kebab-case id', () => {
    // ARRANGE
    const odd = { ...concept('sales'), path: 'docs/llm-wiki/concepts/Sales_Stuff/concept.md' };
    const raw = { ...VALID, concepts: [...VALID.concepts, odd] };
    const expected = [
      { kind: 'concept', record: odd.path, message: 'the folder "Sales_Stuff" is not a kebab-case Concept id' },
    ];
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toEqual(expected);
  });
});
