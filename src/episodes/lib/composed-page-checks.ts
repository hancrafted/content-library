import type { EpisodeStatus } from '@/content-store/schemas/episode.schema';
import { tocSectionsOf } from '@/episodes/components/episode-page/episode-page-container.pure';
import { episodeMinutes } from '@/episodes/components/slide-master/localized-slide';
import { headerModeOf, type EpisodeComposition } from '@/episodes/components/slide-master/slide';
import { localizeSlideOutline } from '@/episodes/components/slide-master/slide-outline';
import type { NamedCheck } from '@/shared/lib/folder-check';
import { LOCALES, type Locale } from '@/shared/lib/locale.pure';
import type { ComposedPage } from './composed-page';
import { containerLosses, repeatedIds } from './composed-page-render';
import { placeSections, sectionOf } from './episode.pure';
import { anchorTitleAt, type PageSummary } from './page-summary.pure';
import { publishedAnchorFindings, type PublishedSnapshot } from './published-anchors';

/*
 * The Episode-level checks that judge a page's composition (ARCH-003 §4.7): its slug, summary, published anchors, DOM
 * ids, Section markers, own text, header, Sections, the Playlist anchors into it and what the container keeps of it.
 * They judge the composition against the page's context and do no I/O. `composed-page-context.ts` reads the context
 * for a page folder; a test hands one in by hand. Like the composition registries, this module sits above the Episodes
 * it checks: it renders Slides through `composed-page-render.ts`.
 */

/** A Section marker, `sections/<name>.ts`: its name and the values it exports. */
export interface SectionMarker {
  readonly name: string;
  readonly exports: readonly unknown[];
}

/** A Playlist entry that opens the page at an anchor, with the Event presenting it. */
export interface PlaylistAnchor {
  readonly event: string;
  readonly anchor: string;
}

/** What a page's composition is judged against, beside its ref. */
export interface PageContext {
  /** Its status in the store; none for a Template, an Explorable page or a Guide. */
  readonly status: EpisodeStatus | undefined;
  /** Its summary in every locale as `npm run registry` wrote it; none when the index lacks it. */
  readonly summary: PageSummary | undefined;
  /** Every Playlist entry that opens it at an anchor. */
  readonly playlistAnchors: readonly PlaylistAnchor[];
  /** Its `published-anchors.json`, or the file to create. */
  readonly published: PublishedSnapshot;
  /** Its Section markers in `sections/`, in name order; none when it keeps no `sections/` folder. */
  readonly markers: readonly SectionMarker[] | undefined;
}

/** A page's composition with its context, read once however many checks judge it. */
export interface CheckedPage {
  readonly composition: EpisodeComposition;
  readonly context: PageContext;
}

/** The Episodes whose Scenes render their own Slide header, by slug, an Event's copy of one included (design-ADR-0012). */
const AUTHORED_HEADERS: readonly string[] = ['ai-token-economy', 'maintaining-markdown-for-ai'];

const MARKERS_DIR = 'sections';

type Read = () => Promise<CheckedPage>;

/** A check that judges the composition against its context. */
const check = (
  name: string,
  judge: (composition: EpisodeComposition, context: PageContext) => readonly string[] | Promise<readonly string[]>,
  read: Read,
): NamedCheck => ({
  name,
  findings: async () => {
    const { composition, context } = await read();
    return judge(composition, context);
  },
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
function staleSummaries(page: ComposedPage, composition: EpisodeComposition, { summary }: PageContext): string[] {
  if (summary === undefined) return [`No summary is registered for "${page.id}": run \`npm run registry\``];
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
function headerDrift(page: ComposedPage, composition: EpisodeComposition): string[] {
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

/** One marker against its Section: it exports exactly one Slide list, its section slide first, and that list is the Section. */
function markerFindings({ name, exports }: SectionMarker, sections: EpisodeComposition['sections']): string[] {
  const firsts = (exports.filter(Array.isArray) as { slug: string }[][]).map(([first]) => first?.slug).join(', ');
  const section = sections.find(([opener]) => opener.slug === name);
  return [
    ...(firsts === name ? [] : [`${MARKERS_DIR}/${name}.ts exports lists opening ${firsts}`]),
    ...(section === undefined || exports.includes(section)
      ? []
      : [`Section ${name} is not the list ${MARKERS_DIR}/${name}.ts exports`]),
  ];
}

/** A page folder's Section markers against its record: one per Section, named after its section slide, none astray. */
function placementMarkerFindings({ sections }: EpisodeComposition, { markers }: PageContext): string[] {
  if (markers === undefined) return [];
  const openers = sections.map(([opener]) => opener.slug);
  const names = markers.map(({ name }) => name);
  const missing = openers.filter((slug) => !names.includes(slug)).map((slug) => `no marker for Section ${slug}`);
  const strays = names
    .filter((name) => !openers.includes(name))
    .map((name) => `${MARKERS_DIR}/${name}.ts names no Section of the record`);
  return [...missing, ...strays, ...markers.flatMap((marker) => markerFindings(marker, sections))];
}

/** A Playlist anchor into this Episode that opens no Section, or whose Section its summary names otherwise. */
function playlistAnchorFindings({ sections }: EpisodeComposition, { playlistAnchors, summary }: PageContext): string[] {
  return playlistAnchors.flatMap(({ event, anchor }) => {
    const section = sectionOf(sections, anchor);
    if (section === undefined) return [`${event} opens #${anchor}, which no Section has`];
    if (anchor.includes('--')) return [];
    return LOCALES.filter(
      (locale) =>
        (summary === undefined ? undefined : anchorTitleAt(summary[locale], anchor)) !== section.messages[locale].title,
    ).map(
      (locale) => `${event} opens #${anchor}: its summary names another title in ${locale} (run \`npm run registry\`)`,
    );
  });
}

/** The checks every Episode's composition holds: its own text, header, Sections and the Playlist anchors into it. */
function episodeOnlyChecks(page: ComposedPage, read: Read): NamedCheck[] {
  return [
    check('gives the Episode its own title, caption and description in en and de', missingOwnText, read),
    check(
      'renders the shared Slide header unless it is an Episode built before it, which authors its own',
      (composition) => headerDrift(page, composition),
      read,
    ),
    check('gives the Episode at least one Section, each opened by a Slide of its own', sectionFindings, read),
    check(
      'opens every Playlist entry into it at a Section it has, named as its summary names it',
      playlistAnchorFindings,
      read,
    ),
  ];
}

/** The checks every composed page holds: its slug, summary and published anchors. */
function composedChecks(page: ComposedPage, read: Read): NamedCheck[] {
  return [
    check(
      "registers a record carrying its folder's slug",
      ({ slug }) => (slug === page.slug ? [] : [`the record names ${slug}, its folder ${page.slug}`]),
      read,
    ),
    check(
      'says in its summary what its composition says, in every locale',
      (composition, context) => staleSummaries(page, composition, context),
      read,
    ),
    check(
      'still produces every published anchor, kept sorted and unique in published-anchors.json',
      (composition, context) => publishedAnchorFindings(page, context, composition),
      read,
    ),
  ];
}

/**
 * The checks an Episode's or a Template's page holds: no DOM id repeated, and its Section markers in step. An Explorable
 * page or a Guide renders its Slides under its own route and keeps no markers.
 */
function slideDeckChecks(page: ComposedPage, read: Read): NamedCheck[] {
  return [
    check(
      'repeats no DOM id when one of its Slides sits twice on one page',
      (composition) => repeatedIds(page, composition),
      read,
    ),
    check(
      'composes its Sections from its markers in sections/, one per Section, each its list, section slide first',
      placementMarkerFindings,
      read,
    ),
  ];
}

/** The composition checks of `page`, judging the composition and context `read` returns, read once on first use. */
export function composedPageChecks(page: ComposedPage, read: Read): NamedCheck[] {
  let checked: Promise<CheckedPage> | undefined;
  const once = () => (checked ??= read());
  const episode = page.kind === 'standalone' || page.kind === 'event-copy';
  const deck = page.kind !== 'explorable-page' && page.kind !== 'guide';
  return [
    ...composedChecks(page, once),
    ...(deck ? slideDeckChecks(page, once) : []),
    ...(episode ? episodeOnlyChecks(page, once) : []),
    ...(page.kind === 'explorable-page'
      ? [
          check(
            'survives the container: every Section keeps its contents entry and its no-section-slide flag',
            (composition) => containerLosses(page, composition),
            once,
          ),
        ]
      : []),
  ];
}
