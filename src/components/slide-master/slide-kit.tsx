import type { SlideLevel } from '@/lib/episode.pure';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { episodeRoute, type EpisodeSlug } from '@/lib/routes';
import type { ReactNode } from 'react';
import { ContextMarker } from './context-marker';
import { ContextRef } from './context-ref';
import { DEFAULT_RICH_TAGS } from './rich-tags';
import type { RuntimeKit, RuntimeTranslator } from './slide-base';
import { SlideTitle } from './slide-master';

/** The optional message key a Slide sets when its on-screen title differs from its table-of-contents `title`. */
const ON_SCREEN_TITLE_KEY = 'heading';

/** What the container knows about the whole Episode when it builds a kit: the same for every Slide. */
export interface EpisodeKitInput {
  readonly episode: EpisodeSlug;
  readonly locale: Locale;
  /** Each Slide slug's placed id, from the walk (`placeSections`): what `slideHref` links to. */
  readonly anchors: ReadonlyMap<string, string>;
  /** Said after a Context reference's phrase, e.g. `opens speaker note`. */
  readonly refLabel: string;
  /** A Context marker's accessible name from its note's header, e.g. `Speaker note: Stateless by design`. */
  readonly markerLabel: (title: string) => string;
}

/** What the container knows about one placed Slide when it builds its kit. */
export interface SlideKitInput {
  readonly t: RuntimeTranslator;
  /** From the Slide's position: `h2` opens a Section, `h3` follows (FE-002 §4). */
  readonly level: SlideLevel;
  /** The slugs of the notes the Slide declares; `ref` takes only these. */
  readonly notes: readonly string[];
  /** The Slide's id, named in the error a bad `ref`, `slideHref` or `template` throws. */
  readonly slideId: string;
}

/**
 * The Slide's translator with `t.rich` knowing the default tags; a tag the Slide passes wins.
 * Every other member is copied from next-intl's translator as it is, so one it adds later arrives too.
 */
function withDefaultTags(t: RuntimeTranslator): RuntimeTranslator {
  const rich = (key: string, values?: object, ...rest: unknown[]) =>
    t.rich(key, { ...DEFAULT_RICH_TAGS, ...values }, ...rest);
  return Object.assign((key: string, ...args: unknown[]) => t(key, ...args), t, { rich });
}

/** `slideHref`: the localized link to a Slide of this Episode, by the anchor the walk placed it at. */
function slideHrefOf(episode: EpisodeKitInput, slideId: string): RuntimeKit['slideHref'] {
  return (slug) => {
    const anchor = episode.anchors.get(slug);
    if (anchor === undefined) throw new Error(`No Slide "${slug}" in "${episode.episode}" to link from "${slideId}".`);
    return localizePath(episodeRoute(episode.episode), episode.locale, anchor);
  };
}

/** `template`: a string leaf of the Slide's keys as written, for a client component to fill. */
function templateOf(t: RuntimeTranslator, slideId: string): RuntimeKit['template'] {
  return (key) => {
    const value = t.raw(key);
    if (typeof value !== 'string') throw new Error(`Template "${key}" on "${slideId}" is not a string leaf.`);
    return value;
  };
}

/**
 * The kit's Context references to one of the Slide's notes (FE-010 §4, FE-012):
 * `ref` underlines a phrase, `marker` follows one with a Context marker and
 * `Marker` places a marker on an element. Each throws for a note the Slide
 * does not declare. A marker is named after its note's header, read from the
 * Slide's own file.
 */
function contextRefsOf(episode: EpisodeKitInput, slide: SlideKitInput): Pick<RuntimeKit, 'ref' | 'marker' | 'Marker'> {
  const declared = (note: string) => {
    if (!slide.notes.includes(note)) {
      throw new Error(`No note "${note}" on "${slide.slideId}": a context reference must name one of its notes.`);
    }
  };
  const labelOf = (note: string) => (declared(note), episode.markerLabel(slide.t(`notes.${note}.header`)));
  return {
    ref: (note) => {
      declared(note);
      return (chunks) => (
        <ContextRef note={note} label={episode.refLabel}>
          {chunks}
        </ContextRef>
      );
    },
    marker: (note) => {
      const label = labelOf(note);
      // A no-break space keeps the marker on the line of the phrase it follows.
      return (chunks) => (
        <>
          {chunks}
          {'\u00a0'}
          <ContextMarker note={note} label={label} placement="inline" />
        </>
      );
    },
    Marker: ({ note, className }) => <ContextMarker note={note} label={labelOf(note)} className={className} />,
  };
}

/**
 * The kit a Slide's `content` receives (FE-002 §3). `Title` is the Slide's
 * heading at the level its position gives it, marked as the `title` target,
 * showing the optional `heading` message when the Slide has one;
 * `ref` wraps a phrase as a Context reference to one of the Slide's notes;
 * `marker` follows a phrase with a Context marker and `Marker` places one on
 * an element;
 * `target` marks the element a note explains; `slideHref` links to another
 * Slide of the Episode; `template` hands a client component a raw string to
 * fill. The types already confine every name; the kit checks again at
 * render, so a cast in a Slide still fails the build.
 */
export function slideKit(episode: EpisodeKitInput, slide: SlideKitInput): RuntimeKit {
  const { level, slideId } = slide;
  // An optional `heading` key in the Slide's messages is the on-screen title; the table of contents keeps `title`.
  const heading = slide.t.has(ON_SCREEN_TITLE_KEY) ? slide.t(ON_SCREEN_TITLE_KEY) : undefined;
  const Title = ({ children }: { children: ReactNode }) => (
    <SlideTitle as={level} data-target="title">
      {heading ?? children}
    </SlideTitle>
  );
  const t = withDefaultTags(slide.t);
  return {
    t,
    locale: episode.locale,
    ...contextRefsOf(episode, slide),
    target: (name) => ({ 'data-target': name }),
    Title,
    slideHref: slideHrefOf(episode, slideId),
    template: templateOf(slide.t, slideId),
  };
}
