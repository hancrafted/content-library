import type { NoteSpec, SegmentSpec, SourceSpec } from '@/components/slide-master/episode-record';
import type { NoteSource, SpeakerNoteItem, VoiceScriptSegment } from '@/lib/context-drawer.pure';
import type { Locale } from '@/lib/locale.pure';
import { segmentSpans, type Span, type SpokenSegment } from '@/lib/speaking-time.pure';

/*
 * Builds a Slide's notes and voice script from translated strings plus the
 * non-localized facts an Episode keeps in the record (FE-010 §6). Each
 * segment's span is counted from its translated words, so a locale's times
 * follow its own Voice script. The output is content records, not markup, so
 * FE-002's "no renderer between a Slide and its markup" does not apply to it.
 */

export interface SlideContextSpec {
  readonly notes?: readonly NoteSpec[];
  readonly segments?: readonly SegmentSpec[];
}

/** Reads one Translation file leaf by key, relative to the Slide's namespace. */
export type ReadString = (key: string) => string;

function sourceOf(read: ReadString, key: string, spec: SourceSpec): NoteSource {
  return { slug: spec.slug, url: spec.url, title: read(`${key}.sources.${spec.slug}.title`) };
}

function noteOf(read: ReadString, spec: NoteSpec): SpeakerNoteItem {
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

type UntimedSegment = Omit<VoiceScriptSegment, 'from' | 'to'>;

/** What a speaker reads aloud for one segment: its script, then its bridge when it declares one. */
function spokenOf(read: ReadString, spec: SegmentSpec): SpokenSegment {
  const key = `voiceScript.segments.${spec.slug}`;
  return { script: read(`${key}.script`), ...(spec.bridge && { bridge: read(`${key}.bridge`) }) };
}

function segmentOf(read: ReadString, spec: SegmentSpec): UntimedSegment {
  const key = `voiceScript.segments.${spec.slug}`;
  return {
    slug: spec.slug,
    title: read(`${key}.title`),
    keywords: read(`${key}.keywords`)
      .split(',')
      .map((word) => word.trim())
      .filter((word) => word !== ''),
    ...spokenOf(read, spec),
  };
}

/** Where the last segment ends, in minutes; 0 without a Voice script. */
function endOf(spans: readonly Span[]): number {
  return spans.at(-1)?.to ?? 0;
}

/**
 * A Slide's spoken minutes in `locale`, read from its Voice script alone: what
 * a landing card totals without building the Slide's notes. The same count
 * `slideContext` gives, so a card never disagrees with the page.
 */
export function slideMinutes(read: ReadString, spec: Pick<SlideContextSpec, 'segments'>, locale: Locale): number {
  return endOf(
    segmentSpans(
      (spec.segments ?? []).map((segment) => spokenOf(read, segment)),
      locale,
    ),
  );
}

/** A Slide's Voice script, each segment timed after the last from its own words in `locale`. */
function voiceScriptOf(read: ReadString, specs: readonly SegmentSpec[], locale: Locale): VoiceScriptSegment[] {
  const segments = specs.map((spec) => segmentOf(read, spec));
  const spans = segmentSpans(segments, locale);
  return segments.map((segment, index) => ({ ...segment, ...spans[index] }));
}

/** A Slide's notes and Voice script in one locale, and its minutes: where the last segment ends, 0 without one. */
export interface SlideContext {
  readonly notes: SpeakerNoteItem[];
  readonly voiceScript: VoiceScriptSegment[];
  readonly minutes: number;
}

/** `read` is a translator namespaced to the Slide itself (`episodes.<ep>.slides.<slide>`). */
export function slideContext(read: ReadString, spec: SlideContextSpec, locale: Locale): SlideContext {
  const voiceScript = voiceScriptOf(read, spec.segments ?? [], locale);
  return {
    notes: (spec.notes ?? []).map((note) => noteOf(read, note)),
    voiceScript,
    minutes: endOf(voiceScript),
  };
}
