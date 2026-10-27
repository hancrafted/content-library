import type { ComposedId } from '@/content-store/catalogue/record-routes';
import type { PlacedListSlide, SlideLevel } from '@/episodes/lib/episode.pure';
import type { NoteSource, SpeakerNoteItem, VoiceScriptSegment } from '@/shared/lib/context-drawer.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { segmentSpans, type SpokenSegment } from '@/shared/lib/speaking-time.pure';
import { createTranslator } from 'next-intl';
import type { ReactNode } from 'react';
import type { EpisodeComposition, HeaderMode, Slide, SlideMessages } from './slide';
import type { NoteSpec, RuntimeTranslator, SegmentSpec, SourceSpec } from './slide-base';
import { captionTextOf, sharedHeaderOf, titleTakenBy, type SlideHeaderText } from './slide-header-text';
import { slideKit, type ReferenceLabels } from './slide-kit';

/*
 * The Localized Slide: one Slide in one locale, as the page renders it
 * (docs/adr/0001-the-slide-is-a-self-contained-folder.md). It hides the Slide's translator over its
 * own messages, its kit and the reading of its title, Speaker notes and Voice
 * script, so the container and an Episode test ask one interface, and it
 * totals an Episode's reading time for the landing card and the table of
 * contents alike. Translation keys follow FE-010 §6; each segment's span is
 * counted from its translated words (docs/adr/0002), so a locale's times
 * follow its own Voice script.
 */

/** A Slide's text in one locale, before an Episode places it. */
interface SlideText {
  readonly slug: string;
  /** Plain text for the table of contents; a purely visual Slide has none and is not listed (FE-002). */
  readonly title?: string;
  /** Spoken reading time in minutes: where its Voice script's last segment ends, 0 without one. */
  readonly minutes: number;
  /** Speaker notes (FE-010); each `target` is the short name of an element of this Slide. */
  readonly notes: readonly SpeakerNoteItem[];
  readonly voiceScript: readonly VoiceScriptSegment[];
}

/** The Speaker notes and Voice script a Slide, or the Title slide, carries: what the Context drawer reads. */
export type SlideContext = Pick<LocalizedSlide, 'notes' | 'voiceScript'>;

/** Where the walk put a Slide: its wrapper id and its Section's slug. */
interface Placement {
  readonly id: string;
  readonly section: string;
}

/**
 * One Slide of an Episode page, localized and placed: its text, its Scene
 * rendered with its kit, and its place. A section slide always has a title,
 * since it names its Section in the table of contents.
 */
export type LocalizedSlide = Placement &
  Omit<SlideText, 'title'> & {
    readonly content: ReactNode;
    /** The Slide header's text: set for a titled Slide of an Episode on the shared header (design-ADR-0012). */
    readonly header?: SlideHeaderText;
  } & (
    | { readonly level: Extract<SlideLevel, 'h2'>; readonly title: string }
    | { readonly level: Extract<SlideLevel, 'h3'>; readonly title?: string }
  );

/** What a Slide needs to know of the Episode page it is localized into: the same for every Slide. */
export interface EpisodeContext {
  readonly episode: ComposedId;
  /** The logical path the page is served at, when an Event presents the Episode: what `slideHref` links on. */
  readonly route?: string;
  readonly locale: Locale;
  /** Every Slide of the Episode as the walk (`placeSections`) placed it: what `slideHref` links to. */
  readonly placed: readonly PlacedListSlide<Slide>[];
  /** What assistive tech hears for a Context reference: the underline's suffix and a marker's name. */
  readonly referenceLabels: ReferenceLabels;
  /** Whether the Slide wrapper renders each Slide's header or its Scene does (the record's `header`). */
  readonly header: HeaderMode;
}

/**
 * next-intl's `createTranslator` over the Slide's own messages. Like the
 * site-wide config (`src/page-assembly/i18n-request.ts`), any missing message or formatting
 * error throws, so untranslated text fails the build instead of shipping.
 */
function ownTranslator(messages: SlideMessages, locale: Locale): RuntimeTranslator {
  const t = createTranslator({
    locale,
    messages,
    onError(error) {
      throw error;
    },
  });
  // `messages` is a runtime record, so next-intl types `t` over unknown keys and
  // its overloads don't line up with RuntimeTranslator's open signature. The
  // members are the same at runtime; each Slide's typed translator is checked
  // against its own JSON at the Slide (the type tests in slide.test.ts).
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

/** A Slide's Voice script, each segment timed after the last from its own words in `locale`. */
function voiceScriptOf(read: Read, specs: readonly SegmentSpec[], locale: Locale): VoiceScriptSegment[] {
  const segments = specs.map((spec) => segmentOf(read, spec));
  const spans = segmentSpans(segments, locale);
  return segments.map((segment, index) => ({ ...segment, ...spans[index] }));
}

/** The Speaker notes, Voice script and reading time a Slide, or the Title slide, declares over its own messages. */
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

function textOf(slide: Slide, t: RuntimeTranslator, locale: Locale): SlideText {
  return {
    slug: slide.slug,
    ...(t.has('title') && { title: t('title') }),
    ...contextOf(slide, t, locale),
  };
}

/**
 * The Title slide's own Speaker notes and Voice script, read from the
 * Episode's text like a Slide's from its own (FE-004 §6). Both are empty for
 * an Episode that declares none, and then the drawer shows its explainer.
 */
export function titleContext(
  record: EpisodeComposition,
  locale: Locale,
): Pick<SlideText, 'notes' | 'voiceScript' | 'minutes'> {
  const specs = { notes: record.notes ?? [], segments: record.segments ?? [] };
  return contextOf(specs, ownTranslator({ ...record.messages[locale] }, locale), locale);
}

/**
 * An Episode's reading time in `locale`: every Slide's minutes, listed in the
 * table of contents or not (docs/adr/0002). The landing card and the table of
 * contents both quote this one sum. Renders no Scene.
 */
export function episodeMinutes(record: EpisodeComposition, locale: Locale): number {
  return record.sections
    .flat()
    .reduce(
      (sum, slide) => sum + textOf(slide, ownTranslator(slide.messages[locale], locale), locale).minutes,
      titleContext(record, locale).minutes,
    );
}

/** The caption the record's Title slide Scene (`title`) gives in its own messages, which the Title slide shows. */
export function titleCaptionOf(slide: Slide, locale: Locale): string | undefined {
  return captionTextOf(ownTranslator(slide.messages[locale], locale));
}

/**
 * The record's authored Title slide Scene (`title`), rendered with a kit over
 * its own messages. The container renders the Title slide's `h1` and caption,
 * so its `Title` throws; its notes and Voice script belong on the record, so
 * declaring either fails the build.
 */
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
      titleTaken: `The Title slide's h1 is the Episode title, which the container renders: drop <Title> from "${slide.slug}".`,
    },
  );
  return slide.content(kit);
}

/**
 * One placed Slide of an Episode, localized: its text, and its Scene rendered
 * with the kit (FE-002 §3). Throws on a missing message, a bad `ref`,
 * `slideHref` or `template`, or a section slide without a title, so a broken
 * Episode fails `next dev` and the static build alike.
 */
export function localizeSlide(
  { id, slide, section, level }: PlacedListSlide<Slide>,
  episode: EpisodeContext,
): LocalizedSlide {
  const { locale } = episode;
  const t = ownTranslator(slide.messages[locale], locale);
  const text = textOf(slide, t, locale);
  const shared = episode.header === 'shared';
  const notes = slide.notes.map((note) => note.slug);
  const kit = slideKit(
    { ...episode, anchors: new Map(episode.placed.map((placed) => [placed.slide.slug, placed.id])) },
    {
      t,
      level,
      notes,
      slideId: id,
      ...(shared && { titleTaken: titleTakenBy(id) }),
    },
  );
  const header = shared
    ? sharedHeaderOf({ t, note: slide.captionNote, declared: notes, markerLabel: episode.referenceLabels.marker })
    : undefined;
  const placed = { id, section, ...text, ...(header && { header }), content: slide.content(kit) };
  if (level === 'h3') return { ...placed, level };
  if (text.title === undefined) throw new Error(`Section "${slide.slug}" opens with a Slide that has no title.`);
  return { ...placed, level, title: text.title };
}
