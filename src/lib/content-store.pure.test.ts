import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { CONTENT_SCHEMAS } from './content-schemas.pure';
import { loadContentStore, type RawContent } from './content-store.pure';

const THEMES = { sales: { icon: 'handshake', accent: 'emerald' } };
const SALES = {
  path: 'docs/llm-wiki/concepts/sales/concept.md',
  markdown: [
    '---',
    'type: concept',
    "title: 'Sales'",
    "description: 'Winning paying customers.'",
    'broader: []',
    'generated:',
    '  by: someone',
    '  at: 2026-10-25T00:00:00Z',
    '---',
    '',
    'Sales is winning paying customers.',
  ].join('\n'),
};
const EPISODE = {
  slug: 'never-too-early-sales',
  status: 'published',
  format: 'foundations',
  concepts: ['sales'],
  applyThemeFromConcept: 'sales',
  publishedOn: '2026-10-19',
};
const WORKSHOP = { slug: 'intro-2026-10-23', date: '2026-10-23', episodes: ['never-too-early-sales'] };
const SOURCE = {
  episode: 'never-too-early-sales',
  slide: 'pipeline',
  note: 'intro',
  slug: 'docs',
  url: 'https://a.example/x',
};
const RESEARCH = {
  path: 'docs/llm-wiki/research/AIE/AIE-0001__ai-as-onboarding-a-colleague/research.md',
  markdown: [
    '---',
    'type: research',
    "title: 'Why?'",
    "description: 'Because.'",
    'generated:',
    '  by: someone',
    '  at: 2026-10-13T00:00:00Z',
    'sources:',
    '  - id: 1',
    '    resource: https://a.example/x',
    "    title: 'A'",
    '---',
    '',
    'Body [1].',
  ].join('\n'),
};
const SLIDE = { path: 'src/components/episodes/never-too-early-sales/slides/pipeline', slug: 'pipeline', title: false };
const POOL_SLIDE = { path: 'src/components/slide-pool/default-alive', slug: 'default-alive', title: false };
const VALID: RawContent = {
  themes: THEMES,
  concepts: [SALES],
  definitionSlides: [],
  episodes: [EPISODE],
  workshops: [WORKSHOP],
  research: [RESEARCH],
  slideSources: [SOURCE],
  slides: [SLIDE, POOL_SLIDE],
};

function refusalsOf(raw: RawContent) {
  const result = loadContentStore(raw);
  return result.ok ? [] : result.refusals;
}

/** Every property of a JSON Schema with no description, as a dotted path. */
function undescribed(node: unknown, at: string): string[] {
  if (typeof node !== 'object' || node === null) return [];
  const schema = node as { properties?: Record<string, unknown>; items?: unknown; anyOf?: unknown[] };
  return [
    ...Object.entries(schema.properties ?? {}).flatMap(([name, child]) => {
      const own = (child as { description?: string }).description === undefined ? [`${at}.${name}`] : [];
      return [...own, ...undescribed(child, `${at}.${name}`)];
    }),
    ...undescribed(schema.items, `${at}[]`),
    ...(schema.anyOf ?? []).flatMap((branch, index) => undescribed(branch, `${at}|${index}`)),
  ];
}

describe('success cases', () => {
  it('returns the typed store when every record is sound', () => {
    // ARRANGE
    const expected = {
      episodes: ['never-too-early-sales'],
      workshops: ['intro-2026-10-23'],
      research: ['AIE-0001'],
      themes: ['sales'],
      concepts: ['sales'],
    };
    // ACT
    const result = loadContentStore(VALID);
    // ASSERT
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect({
      episodes: result.store.episodes.map((e) => e.slug),
      workshops: result.store.workshops.map((w) => w.slug),
      research: result.store.research.map((r) => r.id),
      themes: Object.keys(result.store.themes),
      concepts: result.store.concepts.map((c) => c.id),
    }).toEqual(expected);
  });

  it('takes a Research question id from its folder name, not from a field', () => {
    // ARRANGE
    const expected = 'AIE-0001';
    // ACT
    const result = loadContentStore(VALID);
    // ASSERT
    expect(result.ok && result.store.research[0].id).toBe(expected);
  });
});

describe('failure cases', () => {
  it('names the Episode whose metadata is malformed instead of throwing', () => {
    // ARRANGE
    const raw = { ...VALID, episodes: [{ ...EPISODE, publishedOn: '2026-02-30' }] };
    const expected = { kind: 'episode', record: 'never-too-early-sales' };
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals[0]).toMatchObject(expected);
    expect(refusals[0].message).toContain('publishedOn');
  });

  it('names the theme whose look is malformed', () => {
    // ARRANGE
    const raw = { ...VALID, themes: { sales: { icon: 'handshake', accent: 'mauve' } } };
    const expected = { kind: 'theme', record: 'sales' };
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals[0]).toMatchObject(expected);
  });

  it('names the Workshop whose slug does not end in its date', () => {
    // ARRANGE
    const raw = { ...VALID, workshops: [{ ...WORKSHOP, slug: 'intro-2026-10-24' }] };
    const expected = { kind: 'workshop', record: 'intro-2026-10-24' };
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals[0]).toMatchObject(expected);
  });

  it('names the research file whose frontmatter lacks a description', () => {
    // ARRANGE
    const markdown = RESEARCH.markdown.replace("description: 'Because.'\n", '');
    const raw = { ...VALID, research: [{ ...RESEARCH, markdown }] };
    const expected = { kind: 'research', record: RESEARCH.path };
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals[0]).toMatchObject(expected);
    expect(refusals[0].message).toContain('description');
  });

  it('names a research file whose YAML cannot be read, without throwing', () => {
    // ARRANGE
    const raw = { ...VALID, research: [{ ...RESEARCH, markdown: '---\ntitle: [unclosed\n---\n' }] };
    const expected = { kind: 'research', record: RESEARCH.path };
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals[0]).toMatchObject(expected);
  });

  it('names the Slide source whose url is not an address', () => {
    // ARRANGE
    const raw = { ...VALID, slideSources: [{ ...SOURCE, url: 'not a url' }] };
    const expected = { kind: 'slide-source', record: 'docs' };
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals[0]).toMatchObject(expected);
  });

  it('Two Slides with the same slug anywhere are refused', () => {
    // ARRANGE
    const twin = { ...SLIDE, path: 'src/components/slide-pool/pipeline' };
    const raw = { ...VALID, slides: [SLIDE, POOL_SLIDE, twin] };
    const expected = [
      {
        kind: 'slide',
        record: 'pipeline',
        message:
          'the slug is used by more than one Slide: src/components/episodes/never-too-early-sales/slides/pipeline, src/components/slide-pool/pipeline',
      },
    ];
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toEqual(expected);
  });

  it('refuses two Slides with the same slug in two Episode folders', () => {
    // ARRANGE
    const twin = { ...SLIDE, path: 'src/components/episodes/onboard-ai-every-time/slides/pipeline' };
    const raw = { ...VALID, slides: [SLIDE, twin] };
    const expected = { kind: 'slide', record: 'pipeline' };
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toMatchObject([expected]);
  });

  it('names an Episode that lists a Concept outside the top Concepts', () => {
    // ARRANGE
    const raw = { ...VALID, episodes: [{ ...EPISODE, concepts: ['sales', 'tokens'] }] };
    const expected = [
      {
        kind: 'episode',
        record: 'never-too-early-sales',
        message: 'never-too-early-sales: concepts names tokens, which is not one of the top Concepts',
      },
    ];
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toEqual(expected);
  });

  it.each(Object.entries(CONTENT_SCHEMAS))('gives every field of the %s schema a description', (name, schema) => {
    // ARRANGE
    const json = z.toJSONSchema(schema, { io: 'input' });
    // ACT
    const missing = undescribed(json, name);
    // ASSERT
    expect(missing).toEqual([]);
  });
});

describe('edge cases', () => {
  it('reports every refusal at once, one per malformed record', () => {
    // ARRANGE
    const raw = {
      ...VALID,
      themes: { sales: { icon: 'nope', accent: 'emerald' } },
      workshops: [{ ...WORKSHOP, date: 'soon' }],
    };
    const expected = ['theme', 'workshop'];
    // ACT
    const kinds = [...new Set(refusalsOf(raw).map((r) => r.kind))];
    // ASSERT
    expect(kinds).toEqual(expected);
  });

  it('refuses two research files that share an id', () => {
    // ARRANGE
    const twin = {
      ...RESEARCH,
      path: RESEARCH.path.replace('AIE/', 'AIE/copy/').replace('colleague', 'colleague-two'),
    };
    const raw = { ...VALID, research: [RESEARCH, twin] };
    const expected = { kind: 'research', record: 'AIE-0001' };
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals[0]).toMatchObject(expected);
  });

  it('refuses a research folder whose name is not an id', () => {
    // ARRANGE
    const raw = { ...VALID, research: [{ ...RESEARCH, path: 'docs/llm-wiki/research/AIE/odd-name/research.md' }] };
    const expected = { kind: 'research', record: 'docs/llm-wiki/research/AIE/odd-name/research.md' };
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals[0]).toMatchObject(expected);
  });

  it('lets every Episode keep a Title slide of the same slug, since its anchor stays per Episode', () => {
    // ARRANGE
    const hero = { path: 'src/components/episodes/never-too-early-sales/slides/hero', slug: 'hero', title: true };
    const otherHero = { ...hero, path: 'src/components/episodes/onboard-ai-every-time/slides/hero' };
    const raw = { ...VALID, slides: [SLIDE, hero, otherHero] };
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toEqual([]);
  });

  it('refuses a value that is not an object at all', () => {
    // ARRANGE
    const raw = { ...VALID, episodes: [null, 'text'] };
    const expectedCount = 2;
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toHaveLength(expectedCount);
  });
});
