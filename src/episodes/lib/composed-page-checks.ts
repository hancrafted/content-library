import {
  EVENT_COPIES_FOLDER,
  EXPLORABLE_PAGES_FOLDER,
  episodeRef,
  explorablePageRef,
  guideRef,
  GUIDES_FOLDER,
  templateRef,
  TEMPLATES_FOLDER,
  type EpisodeRef,
  type ExplorablePageRef,
  type GuideRef,
  type TemplateRef,
} from '@/content-store/catalogue/episode-id.pure';
import { listEpisodes, listEvents } from '@/content-store/store';
import { tocSectionsOf } from '@/episodes/components/episode-page/episode-page-container.pure';
import { episodeMinutes } from '@/episodes/components/slide-master/localized-slide';
import { headerModeOf, type EpisodeComposition } from '@/episodes/components/slide-master/slide';
import { localizeSlideOutline } from '@/episodes/components/slide-master/slide-outline';
import { LOCALES, type Locale } from '@/shared/lib/locale.pure';
import path from 'node:path';
import type { ComposedPage } from './composed-page';
import { placementMarkerFindings, publishedAnchorFindings } from './composed-page-files';
import { containerLosses, repeatedIds } from './composed-page-render';
import { placeSections, sectionOf } from './episode.pure';
import { summaryOf } from './page-summary';
import { anchorTitleAt } from './page-summary.pure';

/*
 * The Episode-level checks that read a page's composition (ARCH-003 §4.7): what the registry, summary, DOM-id,
 * placement-marker and published-anchor tests once held for every page at once, now held for one page folder from its
 * own `episode.ts`. `episodeChecks` (`episode-checks.ts`) runs them for a folder whose test hands over its
 * `import.meta.glob('./episode.ts')`, so a page's checks import only its own Slides. Like the composition registries,
 * this module sits above the Episodes it checks: it reads the store, and renders Slides through
 * `composed-page-render.ts`.
 */

/** Modules as `import.meta.glob` returns them, lazy, by path: a page's `./episode.ts`, or its Slides' entries. */
export type GlobEntries = Readonly<Record<string, () => Promise<unknown>>>;

/** One check: the test name it runs under, and its findings, empty when it holds. Run checks share the shape. */
export interface NamedCheck {
  readonly name: string;
  readonly findings: () => Promise<readonly string[]>;
}

/** The Episodes whose Scenes render their own Slide header, by slug, an Event's copy of one included (design-ADR-0012). */
export const AUTHORED_HEADERS: readonly string[] = ['ai-token-economy', 'maintaining-markdown-for-ai'];

/** The page a folder under `src/episodes/` holds, by the ref the store serves it with. */
export function pageRefOf(dir: string): EpisodeRef | TemplateRef | ExplorablePageRef | GuideRef {
  const [first, second, third] =
    dir.split(`${path.sep}src${path.sep}episodes${path.sep}`).at(-1)?.split(path.sep) ?? [];
  if (first === TEMPLATES_FOLDER) return templateRef(second);
  if (first === EXPLORABLE_PAGES_FOLDER) return explorablePageRef(second);
  if (first === GUIDES_FOLDER) return guideRef(second);
  if (first === EVENT_COPIES_FOLDER) return episodeRef(third, second);
  return episodeRef(first);
}

/** The composition an `episode.ts` module exports: its one value carrying Sections and own text. */
function compositionIn(module: unknown): EpisodeComposition {
  const found = Object.values(module as object).find(
    (value): value is EpisodeComposition =>
      typeof value === 'object' && value !== null && 'sections' in value && 'messages' in value,
  );
  if (found === undefined) throw new Error('episode.ts exports no composition');
  return found;
}

/** The composition, loaded once per page folder however many checks read it. */
type Load = () => Promise<EpisodeComposition>;

/** A check over the loaded composition. */
const check = (
  name: string,
  findings: (composition: EpisodeComposition) => readonly string[] | Promise<readonly string[]>,
  load: Load,
): NamedCheck => ({
  name,
  findings: async () => findings(await load()),
});

/** The summary `npm run registry` wrote for a page, field by field, as a composition says it in one locale. */
function localeSummaryOf(composition: EpisodeComposition, locale: Locale) {
  const { title, caption, description } = composition.messages[locale];
  const sections = tocSectionsOf(
    placeSections(composition.sections)
      .flat()
      .map((slide) => localizeSlideOutline(slide, locale)),
  );
  return JSON.stringify({ title, caption, description, minutes: episodeMinutes(composition, locale), sections });
}

/** The locales whose generated summary says other than the composition, or the summary the index lacks. */
function staleSummaries(page: ComposedPage, composition: EpisodeComposition): string[] {
  let summary;
  try {
    summary = summaryOf(page);
  } catch (error) {
    return [`${(error as Error).message}: run \`npm run registry\``];
  }
  return LOCALES.filter((locale) => {
    const { title, caption, description, minutes, sections } = summary[locale];
    return JSON.stringify({ title, caption, description, minutes, sections }) !== localeSummaryOf(composition, locale);
  }).map((locale) => `its ${locale} summary is stale: run \`npm run registry\``);
}

/** An own text the Episode leaves empty or missing, per locale. */
function missingOwnText({ messages }: EpisodeComposition): string[] {
  return (['en', 'de'] as const).flatMap((locale) =>
    (['title', 'caption', 'description'] as const)
      .filter((key) => typeof messages[locale]?.[key] !== 'string' || messages[locale][key] === '')
      .map((key) => `${locale}: no ${key}`),
  );
}

/** A header mode that disagrees with the list of Episodes built before the shared Slide header. */
function headerDrift(page: EpisodeRef, composition: EpisodeComposition): string[] {
  const authored = headerModeOf(composition) === 'authored';
  if (authored === AUTHORED_HEADERS.includes(page.slug)) return [];
  return [
    authored
      ? `${page.slug} authors its header but AUTHORED_HEADERS omits it`
      : `${page.slug} is in AUTHORED_HEADERS but renders the shared header`,
  ];
}

/** No Section, an empty one, or a Slide that opens two. */
function sectionFindings({ sections }: EpisodeComposition): string[] {
  const openers = sections.map(([opener]) => opener?.slug);
  return [
    ...(sections.length === 0 ? ['no Section'] : []),
    ...sections.flatMap((section, index) => (section.length === 0 ? [`Section ${index} is empty`] : [])),
    ...openers.filter((slug, index) => openers.indexOf(slug) !== index).map((slug) => `${slug} opens two Sections`),
  ];
}

/** Every Playlist entry that opens this Episode at an anchor, with the Event presenting it. */
function anchoredEntries(page: EpisodeRef): { event: string; anchor: string }[] {
  return listEvents().flatMap(({ slug, playlist }) =>
    playlist.episodes.flatMap(({ page: entry, anchor }) =>
      entry?.id === page.id && anchor !== undefined ? [{ event: slug, anchor }] : [],
    ),
  );
}

/** A Playlist anchor into this Episode that opens no Section, or whose Section its summary names otherwise. */
function playlistAnchorFindings(page: EpisodeRef, { sections }: EpisodeComposition): string[] {
  return anchoredEntries(page).flatMap(({ event, anchor }) => {
    const section = sectionOf(sections, anchor);
    if (section === undefined) return [`${event} opens #${anchor}, which no Section has`];
    if (anchor.includes('--')) return [];
    return LOCALES.filter(
      (locale) => anchorTitleAt(summaryOf(page as ComposedPage)[locale], anchor) !== section.messages[locale].title,
    ).map(
      (locale) => `${event} opens #${anchor}: its summary names another title in ${locale} (run \`npm run registry\`)`,
    );
  });
}

/** The checks every Episode's composition holds: its own text, header, Sections and the Playlist anchors into it. */
function episodeOnlyChecks(page: EpisodeRef, load: Load): NamedCheck[] {
  return [
    check('gives the Episode its own title, caption and description in en and de', missingOwnText, load),
    check(
      'renders the shared Slide header unless it is an Episode built before it, which authors its own',
      (composition) => headerDrift(page, composition),
      load,
    ),
    check('gives the Episode at least one Section, each opened by a Slide of its own', sectionFindings, load),
    check(
      'opens every Playlist entry into it at a Section it has, named as its summary names it',
      (composition) => playlistAnchorFindings(page, composition),
      load,
    ),
  ];
}

/** The checks every composed page holds: its slug, summary and published anchors. */
function composedChecks(page: ComposedPage, load: Load): NamedCheck[] {
  const status = () => listEpisodes().find(({ ref }) => ref.id === page.id)?.status;
  return [
    check(
      "registers a record carrying its folder's slug",
      ({ slug }) => (slug === page.slug ? [] : [`the record names ${slug}, its folder ${page.slug}`]),
      load,
    ),
    check(
      'says in its summary what its composition says, in every locale',
      (composition) => staleSummaries(page, composition),
      load,
    ),
    check(
      'still produces every published anchor, kept sorted and unique in published-anchors.json',
      (composition) => publishedAnchorFindings(page, status(), composition),
      load,
    ),
  ];
}

/**
 * The checks an Episode's or a Template's page holds: no DOM id repeated, and its Section markers in step. An Explorable
 * page or a Guide renders its Slides under its own route and keeps no markers.
 */
function slideDeckChecks(dir: string, page: ComposedPage, load: Load): NamedCheck[] {
  return [
    check(
      'repeats no DOM id when one of its Slides sits twice on one page',
      (composition) => repeatedIds(page, composition),
      load,
    ),
    check(
      'composes its Sections from its markers in sections/, one per Section, each its list, section slide first',
      (composition) => placementMarkerFindings(dir, composition),
      load,
    ),
  ];
}

/** The composition checks of the page folder `dir`, from its `episode.ts` entry; none when it has no page. */
export function composedPageChecks(dir: string, entry: GlobEntries): NamedCheck[] {
  const load = Object.values(entry)[0];
  if (load === undefined) return [];
  const page = pageRefOf(dir) as ComposedPage;
  let composition: Promise<EpisodeComposition> | undefined;
  const loaded = () => (composition ??= load().then(compositionIn));
  const episode = page.kind === 'standalone' || page.kind === 'event-copy';
  const deck = page.kind !== 'explorable-page' && page.kind !== 'guide';
  return [
    ...composedChecks(page, loaded),
    ...(deck ? slideDeckChecks(dir, page, loaded) : []),
    ...(episode ? episodeOnlyChecks(page, loaded) : []),
    ...(page.kind === 'explorable-page'
      ? [
          check(
            'survives the container: every Section keeps its contents entry and its no-section-slide flag',
            (composition) => containerLosses(page, composition),
            loaded,
          ),
        ]
      : []),
  ];
}
