import type { PlacedListSlide, SlideLevel } from '@/episodes/lib/episode.pure';
import type { NoteSource, SpeakerNoteItem, VoiceScriptSegment } from '@/shared/lib/context-drawer.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { segmentSpans, type SpokenSegment } from '@/shared/lib/speaking-time.pure';
import { createTranslator } from 'next-intl';
import type { ReactNode } from 'react';
import type { EpisodeComposition, HeaderMode, Slide, SlideMessages } from './slide';
import type { NoteSpec, RuntimeTranslator, SegmentSpec, SourceSpec } from './slide-base';
import { headerWithAction, requireTitle, titleTakenBy, type SlideHeaderText } from './slide-header-text';
import { slideKit, type PageIdentity, type ReferenceLabels, type SlideKitInput } from './slide-kit';
import type { SlidePresentation } from './slide-presentation';

// decision: docs/decision-records/0001-the-slide-is-a-self-contained-folder.md
// decision: FE-010 §6
// decision: docs/decision-records/0002-reading-time-from-voice-script.md
interface SlideText {
  readonly presentation?: SlidePresentation;
  readonly slug: string;
  readonly title?: string;
  readonly minutes: number;
  readonly notes: readonly SpeakerNoteItem[];
  readonly voiceScript: readonly VoiceScriptSegment[];
}

export type SlideContext = Pick<LocalizedSlide, 'notes' | 'voiceScript'>;

interface Placement {
  readonly id: string;
  readonly section: string;
}

export type LocalizedSlide = Placement &
  Omit<SlideText, 'title'> & {
    readonly content: ReactNode;
    // decision: docs/decision-records/0012-slide-header-and-play-once-motion.md
    readonly header?: SlideHeaderText;
    readonly withoutSectionSlide?: true;
  } & (
    | { readonly level: Extract<SlideLevel, 'h2'>; readonly title: string }
    | { readonly level: Extract<SlideLevel, 'h3'>; readonly title?: string }
  );

export type EpisodeContext = PageIdentity & {
  readonly locale: Locale;
  readonly placed: readonly PlacedListSlide<Slide>[];
  readonly referenceLabels: ReferenceLabels;
  readonly header: HeaderMode;
};

export function ownTranslator(messages: SlideMessages, locale: Locale): RuntimeTranslator {
  const t = createTranslator({
    locale,
    messages,
    onError(error) {
      throw error;
    },
  });
  return t as unknown as RuntimeTranslator;
}

type Read = (key: string) => string;

function sourceOf(read: Read, key: string, spec: SourceSpec): NoteSource {
  return { slug: spec.slug, url: spec.url, title: read(`${key}.sources.${spec.slug}.title`) };
}

function noteOf(read: Read, spec: NoteSpec): SpeakerNoteItem {
  const key = `notes.${spec.slug}`;
  return {
    slug: spec.slug,
    header: read(`${key}.header`),
    description: read(`${key}.description`),
    target: spec.target,
    ...(spec.sources && { sources: spec.sources.map((source) => sourceOf(read, key, source)) }),
    ...(spec.image && { image: { src: spec.image.src, alt: read(`${key}.image.alt`) } }),
  };
}

type UntimedSegment = Omit<VoiceScriptSegment, 'from' | 'to'> & SpokenSegment;

function segmentOf(read: Read, spec: SegmentSpec): UntimedSegment {
  const key = `voiceScript.segments.${spec.slug}`;
  return {
    slug: spec.slug,
    title: read(`${key}.title`),
    keywords: read(`${key}.keywords`)
      .split(',')
      .map((word) => word.trim())
      .filter((word) => word !== ''),
    script: read(`${key}.script`),
    ...(spec.bridge && { bridge: read(`${key}.bridge`) }),
  };
}

function voiceScriptOf(read: Read, specs: readonly SegmentSpec[], locale: Locale): VoiceScriptSegment[] {
  const segments = specs.map((spec) => segmentOf(read, spec));
  const spans = segmentSpans(segments, locale);
  return segments.map((segment, index) => ({ ...segment, ...spans[index] }));
}

function contextOf(
  specs: { readonly notes: readonly NoteSpec[]; readonly segments: readonly SegmentSpec[] },
  t: RuntimeTranslator,
  locale: Locale,
): Pick<SlideText, 'notes' | 'voiceScript' | 'minutes'> {
  const voiceScript = voiceScriptOf(t, specs.segments, locale);
  return {
    minutes: voiceScript.at(-1)?.to ?? 0,
    notes: specs.notes.map((note) => noteOf(t, note)),
    voiceScript,
  };
}

export function slideTextOf(slide: Slide, t: RuntimeTranslator, locale: Locale): SlideText {
  return {
    presentation: slide.presentation,
    slug: slide.slug,
    ...(t.has('title') && { title: t('title') }),
    ...contextOf(slide, t, locale),
  };
}

// decision: FE-004 §6
export function titleContext(
  record: EpisodeComposition,
  locale: Locale,
): Pick<SlideText, 'notes' | 'voiceScript' | 'minutes'> {
  const specs = { notes: record.notes ?? [], segments: record.segments ?? [] };
  return contextOf(specs, ownTranslator({ ...record.messages[locale] }, locale), locale);
}

// decision: docs/decision-records/0002-reading-time-from-voice-script.md
export function episodeMinutes(record: EpisodeComposition, locale: Locale): number {
  return record.sections
    .flat()
    .reduce(
      (sum, slide) => sum + slideTextOf(slide, ownTranslator(slide.messages[locale], locale), locale).minutes,
      titleContext(record, locale).minutes,
    );
}

function stateOf({ hidden, explorables }: Slide): Pick<SlideKitInput, 'hidden' | 'explorables'> {
  return { ...(hidden !== undefined && { hidden }), ...(explorables !== undefined && { explorables }) };
}

export function localizeTitleScene(slide: Slide, episode: EpisodeContext): ReactNode {
  if (slide.notes.length > 0 || slide.segments.length > 0) {
    throw new Error(`Title slide Scene "${slide.slug}" declares notes or a Voice script: put them on the record.`);
  }
  const t = ownTranslator(slide.messages[episode.locale], episode.locale);
  const kit = slideKit(
    { ...episode, anchors: new Map(episode.placed.map((placed) => [placed.slide.slug, placed.id])) },
    {
      t,
      level: 'h2',
      notes: [],
      slideId: slide.slug,
      ...stateOf(slide),
      titleTaken: `The Title slide's h1 is the Episode title, which the container renders: drop <Title> from "${slide.slug}".`,
    },
  );
  return slide.content(kit);
}

const sectionTitleOf = (namer: Slide, locale: Locale) =>
  requireTitle(namer.slug, slideTextOf(namer, ownTranslator(namer.messages[locale], locale), locale).title);

// decision: FE-002 §3
export function localizeSlide(
  { id, slide, section, level, standsInFor }: PlacedListSlide<Slide>,
  episode: EpisodeContext,
): LocalizedSlide {
  const { locale } = episode;
  const t = ownTranslator(slide.messages[locale], locale);
  const text = slideTextOf(slide, t, locale);
  const shared = episode.header === 'shared';
  const notes = slide.notes.map((note) => note.slug);
  const kit = slideKit(
    { ...episode, anchors: new Map(episode.placed.map((placed) => [placed.slide.slug, placed.id])) },
    {
      t,
      level,
      notes,
      slideId: id,
      ...stateOf(slide),
      ...(shared && { titleTaken: titleTakenBy(id) }),
    },
  );
  const header = shared
    ? headerWithAction(slide, { t, kit, notes, markerLabel: episode.referenceLabels.marker })
    : undefined;
  const placed = { id, section, ...text, ...(header && { header }), content: slide.content(kit) };
  if (level === 'h3') return { ...placed, level };
  const title = sectionTitleOf(standsInFor ?? slide, locale);
  return { ...placed, level, title, ...(standsInFor && { withoutSectionSlide: true as const }) };
}
