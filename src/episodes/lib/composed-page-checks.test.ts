import { episodeRef, episodeRefOf, explorablePageRef, templateRef } from '@/content-store/catalogue/episode-id.pure';
import { EPISODE_IDS } from '@/content-store/catalogue/record-routes';
import type { EpisodeComposition, Section, Slide } from '@/episodes/components/slide-master/slide';
import type { NamedCheck } from '@/shared/lib/folder-check';
import { createElement, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import type { ComposedPage } from './composed-page';
import { authoredHeaderStrays, composedPageChecks, type PageContext } from './composed-page-checks';
import { withoutSectionSlide } from './episode.pure';
import type { LocaleSummary } from './page-summary.pure';

/*
 * The composition checks judge a page's composition against its context, handed in here by hand: no store, no
 * generated summary and no folder on disk. Each check gets a failure planted through the context or the composition.
 */

function slideOf(slug: string, title: string | undefined, scene: () => ReactNode = () => null): Slide {
  const messages = title === undefined ? {} : { title };
  return { slug, messages: { en: messages, de: messages }, notes: [], segments: [], content: scene };
}

const INTRO = [slideOf('intro', 'Intro'), slideOf('detail', 'Detail')] as unknown as Section;

const OWN_TEXT = { title: 'Demo', caption: 'A demo', description: 'A demo page' };

/** The composition of `page`, named after its folder, with one Section, `intro`, unless `fields` says otherwise. */
function compositionOf(page: ComposedPage, fields: Partial<EpisodeComposition> = {}): EpisodeComposition {
  return { slug: page.slug, messages: { en: OWN_TEXT, de: OWN_TEXT }, sections: [INTRO], ...fields };
}

const SUMMARY: LocaleSummary = {
  ...OWN_TEXT,
  minutes: 0,
  sections: [
    { id: 'intro', title: 'Intro', minutes: 0, items: [{ id: 'intro--detail', title: 'Detail', minutes: 0 }] },
  ],
};

/** A context that agrees with `compositionOf(page)`, unless `fields` says otherwise. */
function contextOf(fields: Partial<PageContext> = {}): PageContext {
  return {
    status: 'published',
    summary: { en: SUMMARY, de: SUMMARY },
    playlistAnchors: [{ event: 'demo-event', anchor: 'intro' }],
    published: { anchors: ['intro', 'intro--detail'] },
    markers: [{ name: 'intro', exports: [INTRO] }],
    ...fields,
  };
}

const EPISODE = episodeRef('ai-attention-span');
const TEMPLATE = templateRef('grids');
const EXPLORABLE = explorablePageRef('context-window');

function checksOf(page: ComposedPage, composition: EpisodeComposition, context: PageContext): NamedCheck[] {
  return composedPageChecks(page, async () => ({ composition, context }));
}

async function findingsOf(checks: readonly NamedCheck[], name: string): Promise<readonly string[]> {
  const found = checks.find((check) => check.name.startsWith(name));
  if (found === undefined) throw new Error(`No check named "${name}…" among ${checks.map((check) => check.name)}`);
  return found.findings();
}

async function allFindingsOf(checks: readonly NamedCheck[]): Promise<string[]> {
  return (await Promise.all(checks.map(({ findings }) => findings()))).flat();
}

describe('success cases', () => {
  it('finds nothing on an Episode page whose context agrees with its composition', async () => {
    // ARRANGE
    const checks = checksOf(EPISODE, compositionOf(EPISODE), contextOf());
    const expected: string[] = [];
    // ACT
    const found = await allFindingsOf(checks);
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('finds nothing on a Template, whose anchors are always bound, while it still produces its snapshot', async () => {
    // ARRANGE
    const checks = checksOf(TEMPLATE, compositionOf(TEMPLATE), contextOf({ status: undefined }));
    const expected: string[] = [];
    // ACT
    const found = await allFindingsOf(checks);
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('lists only Episodes whose folders still exist among those that author their own header', () => {
    // ARRANGE
    // The generated id list is the Episode folders' names (`npm run registry`): no Episode is imported to read it.
    const folders = EPISODE_IDS.map((id) => episodeRefOf(id).slug);
    const expected: string[] = [];
    // ACT
    const strays = authoredHeaderStrays(folders);
    // ASSERT
    expect(strays).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('names an Episode that authors its own header after its folder is deleted', () => {
    // ARRANGE
    const folders = ['ai-token-economy'];
    const expected = ['AUTHORED_HEADERS names maintaining-markdown-for-ai, which no Episode folder holds: remove it'];
    // ACT
    const strays = authoredHeaderStrays(folders);
    // ASSERT
    expect(strays).toEqual(expected);
  });

  it('names a record whose slug is not its folder', async () => {
    // ARRANGE
    const checks = checksOf(EPISODE, compositionOf(EPISODE, { slug: 'other' }), contextOf());
    const expected = ['the record names other, its folder ai-attention-span'];
    // ACT
    const found = await findingsOf(checks, 'registers a record');
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('names a locale whose summary says other than the composition', async () => {
    // ARRANGE
    const summary = { en: SUMMARY, de: { ...SUMMARY, title: 'Alt' } };
    const checks = checksOf(EPISODE, compositionOf(EPISODE), contextOf({ summary }));
    const expected = ['its de summary is stale: run `npm run registry`'];
    // ACT
    const found = await findingsOf(checks, 'says in its summary');
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('names a published anchor a bound page no longer produces', async () => {
    // ARRANGE
    const published = { anchors: ['intro', 'intro--detail', 'intro--gone'] };
    const checks = checksOf(TEMPLATE, compositionOf(TEMPLATE), contextOf({ published }));
    const expected = [
      'Episode "grids" no longer produces the anchor "intro--gone". It is a published anchor: a shared link may point at it. Remove it from published-anchors.json only deliberately.',
    ];
    // ACT
    const found = await findingsOf(checks, 'still produces every published anchor');
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('names a DOM id a Slide repeats when it sits twice on one page', async () => {
    // ARRANGE
    const fixed = slideOf('fixed', 'Fixed', () => createElement('span', { id: 'label' }));
    const sections = [[slideOf('intro', 'Intro'), fixed] as unknown as Section];
    const checks = checksOf(TEMPLATE, compositionOf(TEMPLATE, { sections }), contextOf());
    const expected = ['fixed: id "label" repeats'];
    // ACT
    const found = await findingsOf(checks, 'repeats no DOM id');
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('names a Section with no marker, a marker naming no Section, and a marker exporting another list', async () => {
    // ARRANGE
    const copy = [...INTRO];
    const markers = [
      { name: 'outro', exports: [[slideOf('outro', 'Outro')]] },
      { name: 'intro', exports: [copy] },
    ];
    const checks = checksOf(TEMPLATE, compositionOf(TEMPLATE), contextOf({ markers: markers.slice(0, 1) }));
    const strayChecks = checksOf(TEMPLATE, compositionOf(TEMPLATE), contextOf({ markers: markers.slice(1) }));
    const expected = {
      missing: ['no marker for Section intro', 'sections/outro.ts names no Section of the record'],
      copied: ['Section intro is not the list sections/intro.ts exports'],
    };
    // ACT
    const found = {
      missing: await findingsOf(checks, 'composes its Sections from its markers'),
      copied: await findingsOf(strayChecks, 'composes its Sections from its markers'),
    };
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('names an own text an Episode leaves empty', async () => {
    // ARRANGE
    const messages = { en: OWN_TEXT, de: { ...OWN_TEXT, caption: '' } };
    const checks = checksOf(EPISODE, compositionOf(EPISODE, { messages }), contextOf());
    const expected = ['de: no caption'];
    // ACT
    const found = await findingsOf(checks, 'gives the Episode its own title');
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('names an Episode that authors its header without being one built before the shared header', async () => {
    // ARRANGE
    const checks = checksOf(EPISODE, compositionOf(EPISODE, { header: 'authored' }), contextOf());
    const expected = ['ai-attention-span authors its header but AUTHORED_HEADERS omits it'];
    // ACT
    const found = await findingsOf(checks, 'renders the shared Slide header');
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('names an Episode with no Section', async () => {
    // ARRANGE
    const checks = checksOf(EPISODE, compositionOf(EPISODE, { sections: [] }), contextOf());
    const expected = ['no Section'];
    // ACT
    const found = await findingsOf(checks, 'gives the Episode at least one Section');
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('names a Playlist anchor no Section has, and one whose summary names another title', async () => {
    // ARRANGE
    const playlistAnchors = [
      { event: 'demo-event', anchor: 'outro' },
      { event: 'demo-event', anchor: 'intro' },
    ];
    const summary = { en: SUMMARY, de: { ...SUMMARY, sections: [{ ...SUMMARY.sections[0], title: 'Einstieg' }] } };
    const checks = checksOf(EPISODE, compositionOf(EPISODE), contextOf({ playlistAnchors, summary }));
    const expected = [
      'demo-event opens #outro, which no Section has',
      'demo-event opens #intro: its summary names another title in de (run `npm run registry`)',
    ];
    // ACT
    const found = await findingsOf(checks, 'opens every Playlist entry');
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('names a Section an Explorable page loses through the container', async () => {
    // ARRANGE
    const lonely = withoutSectionSlide([slideOf('about', 'About')] as unknown as Section) as unknown as Section;
    const checks = checksOf(EXPLORABLE, compositionOf(EXPLORABLE, { sections: [lonely] }), contextOf());
    const expected = ['0 Slides flagged without a section slide, 1 declared'];
    // ACT
    const found = await findingsOf(checks, 'survives the container');
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('asks for `npm run registry` when the index holds no summary for the page', async () => {
    // ARRANGE
    const checks = checksOf(EPISODE, compositionOf(EPISODE), contextOf({ summary: undefined }));
    const expected = ['No summary is registered for "ai-attention-span": run `npm run registry`'];
    // ACT
    const found = await findingsOf(checks, 'says in its summary');
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('prints the snapshot a bound page lacks, and names one out of order', async () => {
    // ARRANGE
    const missing = { missing: { file: '/grids/published-anchors.json', contents: '["intro", "intro--detail"]\n' } };
    const unsorted = { anchors: ['intro--detail', 'intro'] };
    const expected = {
      missing: [
        'Episode "grids" has no published-anchors.json. Create /grids/published-anchors.json with this content:\n["intro", "intro--detail"]\n\n',
      ],
      unsorted: ['published-anchors.json is not sorted and unique'],
    };
    // ACT
    const found = {
      missing: await findingsOf(
        checksOf(TEMPLATE, compositionOf(TEMPLATE), contextOf({ published: missing })),
        'still',
      ),
      unsorted: await findingsOf(
        checksOf(TEMPLATE, compositionOf(TEMPLATE), contextOf({ published: unsorted })),
        'still',
      ),
    };
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('leaves an upcoming Episode unbound, so its snapshot may still change', async () => {
    // ARRANGE
    const published = { anchors: ['intro--gone'] };
    const checks = checksOf(EPISODE, compositionOf(EPISODE), contextOf({ status: 'upcoming', published }));
    const expected: string[] = [];
    // ACT
    const found = await findingsOf(checks, 'still produces every published anchor');
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('checks no markers on an Explorable page, which keeps none, but checks the container instead', async () => {
    // ARRANGE
    const checks = checksOf(EXPLORABLE, compositionOf(EXPLORABLE), contextOf({ markers: undefined }));
    const expected = { markers: false, container: true };
    // ACT
    const names = checks.map(({ name }) => name);
    const seen = {
      markers: names.some((name) => name.startsWith('composes its Sections')),
      container: names.some((name) => name.startsWith('survives the container')),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});
