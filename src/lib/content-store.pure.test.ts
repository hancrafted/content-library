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
  type: 'standard',
  visibility: 'public',
  status: 'published',
  format: 'foundations',
  concepts: ['sales'],
  applyThemeFromConcept: 'sales',
  publishedOn: '2026-10-19',
};
/** An event-frame Episode: the agenda page of one Event, always unlisted. Its slug has a registered page. */
const FRAME = {
  ...EPISODE,
  slug: 'axel-agentic-workflow-agenda',
  type: 'event-frame',
  visibility: 'unlisted',
  publishedOn: '2026-10-23',
};
const PLAYLIST = {
  id: 'axel-agentic-workflow',
  type: 'event',
  visibility: 'unlisted',
  episodes: ['axel-agentic-workflow-agenda', 'never-too-early-sales'],
};
const EVENT = {
  slug: '2026-10-23-axel-agentic-workflow',
  date: '2026-10-23',
  kind: 'workshop',
  audience: 'german-business',
  playlist: 'axel-agentic-workflow',
};
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
/** Each Episode's Slide list: the agenda holds a Slide of its own and one of the public Episode's two. */
const SLIDE_LISTS = [
  { episode: 'never-too-early-sales', slides: ['pipeline', 'close'] },
  { episode: 'axel-agentic-workflow-agenda', slides: ['agenda', 'pipeline'] },
];
/** The agenda holding every Slide of the public Episode: derived from it. */
const DERIVED_LISTS = [
  SLIDE_LISTS[0],
  { episode: 'axel-agentic-workflow-agenda', slides: ['agenda', 'pipeline', 'close'] },
];
const VALID: RawContent = {
  themes: THEMES,
  concepts: [SALES],
  definitionSlides: [],
  episodes: [EPISODE, FRAME],
  episodeSlides: SLIDE_LISTS,
  events: [EVENT],
  playlists: [PLAYLIST],
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
  it('loads an Episode derived from a public one when it names that Episode as its canonical', () => {
    // ARRANGE
    const derived = { ...FRAME, canonicalEpisode: 'never-too-early-sales' };
    const raw = { ...VALID, episodes: [EPISODE, derived], episodeSlides: DERIVED_LISTS };
    const expected = 'never-too-early-sales';
    // ACT
    const result = loadContentStore(raw);
    // ASSERT
    expect(result.ok ? [] : result.refusals).toEqual([]);
    expect(result.ok && result.store.episodes.find((e) => e.slug === derived.slug)).toMatchObject({
      canonicalEpisode: expected,
    });
  });

  it('returns the typed store when every record is sound', () => {
    // ARRANGE
    const expected = {
      episodes: ['never-too-early-sales', 'axel-agentic-workflow-agenda'],
      events: ['2026-10-23-axel-agentic-workflow'],
      playlists: ['axel-agentic-workflow'],
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
      events: result.store.events.map((e) => e.slug),
      playlists: result.store.playlists.map((p) => p.id),
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
  it('An Episode derived from a public one that does not name its canonical Episode fails', () => {
    // ARRANGE
    const raw = { ...VALID, episodeSlides: DERIVED_LISTS };
    const expected = { kind: 'episode', record: 'axel-agentic-workflow-agenda' };
    const named = 'canonicalEpisode: never-too-early-sales';
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toContainEqual(expect.objectContaining(expected));
    expect(refusals.map(({ message }) => message).join('\n')).toContain(named);
  });

  it.each([
    ['an Episode that does not exist', 'no-such-episode'],
    ['an unlisted Episode', 'axel-agentic-workflow-agenda'],
  ])('refuses a canonicalEpisode that names %s', (_case, target) => {
    // ARRANGE
    const pointing = { ...FRAME, canonicalEpisode: target };
    const raw = { ...VALID, episodes: [EPISODE, pointing] };
    const expected = { kind: 'episode', record: 'axel-agentic-workflow-agenda' };
    const reason = 'must name a public Episode';
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toContainEqual(expect.objectContaining(expected));
    expect(refusals.map(({ message }) => message).join('\n')).toContain(reason);
  });

  it('refuses a canonicalEpisode on a public Episode, which is its own canonical', () => {
    // ARRANGE
    const pointing = { ...EPISODE, canonicalEpisode: 'never-too-early-sales' };
    const raw = { ...VALID, episodes: [pointing, FRAME] };
    const expected = { kind: 'episode', record: 'never-too-early-sales' };
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toContainEqual(expect.objectContaining(expected));
  });

  it('names the Episode whose metadata is malformed instead of throwing', () => {
    // ARRANGE
    const raw = { ...VALID, episodes: [{ ...EPISODE, publishedOn: '2026-02-30' }, FRAME] };
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

  it('names the Event whose slug does not start with its date', () => {
    // ARRANGE
    const raw = { ...VALID, events: [{ ...EVENT, slug: '2026-10-24-axel-agentic-workflow' }] };
    const expected = { kind: 'event', record: '2026-10-24-axel-agentic-workflow' };
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals[0]).toMatchObject(expected);
  });

  it.each([
    {
      name: 'a public event-frame Episode',
      raw: { ...VALID, episodes: [EPISODE, { ...FRAME, visibility: 'public' }] },
      expected: { kind: 'episode', record: 'axel-agentic-workflow-agenda' },
    },
    {
      name: 'visibility: attendees',
      raw: { ...VALID, playlists: [{ ...PLAYLIST, visibility: 'attendees' }] },
      expected: { kind: 'playlist', record: 'axel-agentic-workflow' },
    },
    {
      name: 'an Event whose Playlist is missing',
      raw: { ...VALID, events: [{ ...EVENT, playlist: 'no-such-playlist' }] },
      expected: { kind: 'event', record: '2026-10-23-axel-agentic-workflow' },
    },
    {
      name: 'an Event whose Playlist is not type: event',
      raw: { ...VALID, playlists: [{ ...PLAYLIST, type: 'standard' }] },
      expected: { kind: 'event', record: '2026-10-23-axel-agentic-workflow' },
    },
  ])('The schema refuses $name', ({ raw, expected }) => {
    // ARRANGE
    const records = raw;
    // ACT
    const refusals = refusalsOf(records);
    // ASSERT
    expect(refusals).toContainEqual(expect.objectContaining(expected));
  });

  it('An orphan unlisted Episode is refused', () => {
    // ARRANGE
    const orphan = { ...EPISODE, slug: 'axel-agentic-workflow-agenda', visibility: 'unlisted' };
    const raw = { ...VALID, episodes: [orphan], events: [], playlists: [] };
    const expected = { kind: 'episode', record: 'axel-agentic-workflow-agenda' };
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toContainEqual(expect.objectContaining(expected));
    expect(refusals.map(({ message }) => message).join('\n')).toContain('no Event');
  });

  it('A public Playlist of type standard with an unlisted Episode is refused; a public Event may present unlisted Episodes', () => {
    // ARRANGE
    const curated = {
      id: 'starter',
      type: 'standard',
      visibility: 'public',
      episodes: ['axel-agentic-workflow-agenda'],
    };
    const leaking = { ...VALID, playlists: [PLAYLIST, curated] };
    const publicEvent = { ...VALID, playlists: [{ ...PLAYLIST, visibility: 'public' }] };
    const expected = { kind: 'playlist', record: 'starter' };
    // ACT
    const leakingRefusals = refusalsOf(leaking);
    const publicEventResult = loadContentStore(publicEvent);
    // ASSERT
    expect(leakingRefusals).toContainEqual(expect.objectContaining(expected));
    expect(publicEventResult.ok).toBe(true);
  });

  it("An Event's Playlist that does not open with its event-frame Episode is refused", () => {
    // ARRANGE
    const raw = { ...VALID, playlists: [{ ...PLAYLIST, episodes: [...PLAYLIST.episodes].reverse() }] };
    const expected = { kind: 'playlist', record: 'axel-agentic-workflow' };
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toContainEqual(expect.objectContaining(expected));
  });

  it('An upcoming Episode that is unlisted is refused', () => {
    // ARRANGE
    const upcoming = {
      slug: 'next-one',
      type: 'standard',
      visibility: 'unlisted',
      status: 'upcoming',
      format: 'short',
      concepts: ['sales'],
      applyThemeFromConcept: 'sales',
    };
    const raw = { ...VALID, episodes: [EPISODE, FRAME, upcoming] };
    const expected = { kind: 'episode', record: 'next-one' };
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toContainEqual(expect.objectContaining(expected));
  });

  it('Two Episodes with the same slug are refused', () => {
    // ARRANGE
    const raw = { ...VALID, episodes: [EPISODE, FRAME, { ...EPISODE, publishedOn: '2026-10-20' }] };
    const expected = { kind: 'episode', record: 'never-too-early-sales' };
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toContainEqual(expect.objectContaining(expected));
  });

  it('A Playlist naming an Episode that does not exist is refused', () => {
    // ARRANGE
    const raw = { ...VALID, playlists: [{ ...PLAYLIST, episodes: [...PLAYLIST.episodes, 'no-such-episode'] }] };
    const expected = { kind: 'playlist', record: 'axel-agentic-workflow' };
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toContainEqual(expect.objectContaining(expected));
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
    const raw = { ...VALID, episodes: [{ ...EPISODE, concepts: ['sales', 'tokens'] }, FRAME] };
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
  it('counts no unlisted Episode as derived from a public one that holds no Slide', () => {
    // ARRANGE
    const lists = [{ episode: 'never-too-early-sales', slides: [] }, SLIDE_LISTS[1]];
    const raw = { ...VALID, episodeSlides: lists };
    const expected: unknown[] = [];
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toEqual(expected);
  });

  it('reports every refusal at once, one per malformed record', () => {
    // ARRANGE
    const raw = {
      ...VALID,
      themes: { sales: { icon: 'nope', accent: 'emerald' } },
      events: [{ ...EVENT, date: 'soon' }],
    };
    const expected = ['theme', 'event'];
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
