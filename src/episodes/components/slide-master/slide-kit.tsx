import { ownRouteOf, type ComposedId } from '@/content-store/catalogue/record-routes';
import type { SlideLevel } from '@/episodes/lib/episode.pure';
import { localizePath, type Locale } from '@/shared/lib/locale.pure';
import type { ReactNode } from 'react';
import { ContextMarker } from './context-marker';
import { ContextRef } from './context-ref';
import { DEFAULT_RICH_TAGS } from './rich-tags';
import type { RuntimeKit, RuntimeTranslator } from './slide-base';
import { SlideTitle } from './slide-master';

export const ON_SCREEN_TITLE_KEY = 'heading';

export interface ReferenceLabels {
  readonly ref: string;
  readonly marker: (title: string) => string;
}

export interface EpisodeKitInput {
  readonly episode: ComposedId;
  readonly route?: string;
  readonly locale: Locale;
  readonly anchors: ReadonlyMap<string, string>;
  readonly referenceLabels: ReferenceLabels;
}

export interface SlideKitInput {
  readonly t: RuntimeTranslator;
  // decision: FE-002 §4
  readonly level: SlideLevel;
  readonly notes: readonly string[];
  readonly slideId: string;
  readonly titleTaken?: string;
}

function withDefaultTags(t: RuntimeTranslator): RuntimeTranslator {
  const rich = (key: string, values?: object, ...rest: unknown[]) =>
    t.rich(key, { ...DEFAULT_RICH_TAGS, ...values }, ...rest);
  return Object.assign((key: string, ...args: unknown[]) => t(key, ...args), t, { rich });
}

function slideHrefOf(episode: EpisodeKitInput, slideId: string): RuntimeKit['slideHref'] {
  return (slug) => {
    const anchor = episode.anchors.get(slug);
    if (anchor === undefined) throw new Error(`No Slide "${slug}" in "${episode.episode}" to link from "${slideId}".`);
    return localizePath(episode.route ?? ownRouteOf(episode.episode), episode.locale, anchor);
  };
}

function templateOf(t: RuntimeTranslator, slideId: string): RuntimeKit['template'] {
  return (key) => {
    const value = t.raw(key);
    if (typeof value !== 'string') throw new Error(`Template "${key}" on "${slideId}" is not a string leaf.`);
    return value;
  };
}

// decision: FE-010 §4
// decision: docs/adr/0013-context-markers.md
function contextRefsOf(episode: EpisodeKitInput, slide: SlideKitInput): Pick<RuntimeKit, 'ref' | 'marker' | 'Marker'> {
  const declared = (note: string) => {
    if (!slide.notes.includes(note)) {
      throw new Error(`No note "${note}" on "${slide.slideId}": a context reference must name one of its notes.`);
    }
  };
  const labelOf = (note: string) => (declared(note), episode.referenceLabels.marker(slide.t(`notes.${note}.header`)));
  return {
    ref: (note) => {
      declared(note);
      return (chunks) => (
        <ContextRef note={note} label={episode.referenceLabels.ref}>
          {chunks}
        </ContextRef>
      );
    },
    marker: (note, className) => {
      const label = labelOf(note);
      return (chunks) => (
        <>
          {chunks}
          {'\u00a0'}
          <ContextMarker note={note} label={label} placement="inline" className={className} />
        </>
      );
    },
    Marker: (props) => <ContextMarker {...props} label={labelOf(props.note)} />,
  };
}

function titleOf({ t, level, titleTaken }: SlideKitInput): RuntimeKit['Title'] {
  const heading = t.has(ON_SCREEN_TITLE_KEY) ? t(ON_SCREEN_TITLE_KEY) : undefined;
  return function Title({ children }: { children: ReactNode }) {
    if (titleTaken !== undefined) throw new Error(titleTaken);
    return (
      <SlideTitle as={level} data-target="title">
        {heading ?? children}
      </SlideTitle>
    );
  };
}

// decision: FE-002 §3
export function slideKit(episode: EpisodeKitInput, slide: SlideKitInput): RuntimeKit {
  const { slideId } = slide;
  const Title = titleOf(slide);
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
