import type { SlideLevel } from '@/lib/episode.pure';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { episodeRoute, type EpisodeSlug } from '@/lib/routes';
import type { ReactNode } from 'react';
import { ContextRef } from './context-ref';
import type { RuntimeKit, RuntimeTranslator } from './episode-record';
import { DEFAULT_RICH_TAGS } from './rich-tags';
import { SlideTitle } from './slide-master';

/** What the container knows about the whole Episode when it builds a kit: the same for every Slide. */
export interface EpisodeKitInput {
  readonly episode: EpisodeSlug;
  readonly locale: Locale;
  /** Each Slide slug's placed id, from the walk (`placeSections`): what `slideHref` links to. */
  readonly anchors: ReadonlyMap<string, string>;
  /** Said after a Context reference's phrase, e.g. `opens speaker note`. */
  readonly refLabel: string;
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

/** The Slide's translator with `t.rich` knowing the default tags; a tag the Slide passes wins. */
function withDefaultTags(t: RuntimeTranslator): RuntimeTranslator {
  const rich = (key: string, values?: object, ...rest: unknown[]) =>
    t.rich(key, { ...DEFAULT_RICH_TAGS, ...values }, ...rest);
  return Object.assign((key: string, ...args: unknown[]) => t(key, ...args), {
    rich,
    markup: t.markup,
    raw: t.raw,
    has: t.has,
  });
}

/** Links and templates: the kit's fields that read the Episode, not the Slide's own markup. */
function lookups(episode: EpisodeKitInput, { t, slideId }: SlideKitInput): Pick<RuntimeKit, 'slideHref' | 'template'> {
  const slideHref = (slug: string) => {
    const anchor = episode.anchors.get(slug);
    if (anchor === undefined) throw new Error(`No Slide "${slug}" in "${episode.episode}" to link from "${slideId}".`);
    return localizePath(episodeRoute(episode.episode), episode.locale, anchor);
  };
  const template = (key: string) => {
    const value = t.raw(key);
    if (typeof value !== 'string') throw new Error(`Template "${key}" on "${slideId}" is not a string leaf.`);
    return value;
  };
  return { slideHref, template };
}

/**
 * The kit a Slide's `content` receives (FE-002 §3). `Title` is the Slide's
 * heading at the level its position gives it, marked as the `title` target;
 * `ref` wraps a phrase as a Context reference to one of the Slide's notes;
 * `target` marks the element a note explains; `slideHref` links to another
 * Slide of the Episode; `template` hands a client component a raw string to
 * fill. The types already confine every name; the kit checks again at
 * render, so a cast in a Slide still fails the build.
 */
export function slideKit(episode: EpisodeKitInput, slide: SlideKitInput): RuntimeKit {
  const { level, notes, slideId } = slide;
  const Title = ({ children }: { children: ReactNode }) => (
    <SlideTitle as={level} data-target="title">
      {children}
    </SlideTitle>
  );
  const ref = (note: string) => {
    if (!notes.includes(note)) {
      throw new Error(`No note "${note}" on "${slideId}": a context reference must name one of its notes.`);
    }
    return (chunks: ReactNode) => (
      <ContextRef note={note} label={episode.refLabel}>
        {chunks}
      </ContextRef>
    );
  };
  const t = withDefaultTags(slide.t);
  return {
    t,
    locale: episode.locale,
    ref,
    target: (name) => ({ 'data-target': name }),
    Title,
    ...lookups(episode, slide),
  };
}
