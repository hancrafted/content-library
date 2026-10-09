import type { NoteSpec, SegmentSpec, SourceSpec } from '@/components/slide-master/episode-record';
import type { NoteSource, SpeakerNoteItem, VoiceScriptSegment } from '@/lib/context-drawer.pure';

/*
 * Builds a Slide's notes and voice script from translated strings plus the
 * non-localized facts an Episode keeps in the record (FE-010 §6). The output is
 * content records, not markup, so FE-002's "no renderer between a Slide and its
 * markup" does not apply to it.
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

function segmentOf(read: ReadString, spec: SegmentSpec): VoiceScriptSegment {
  const key = `voiceScript.segments.${spec.slug}`;
  return {
    slug: spec.slug,
    from: spec.from,
    to: spec.to,
    title: read(`${key}.title`),
    keywords: read(`${key}.keywords`)
      .split(',')
      .map((word) => word.trim())
      .filter((word) => word !== ''),
    script: read(`${key}.script`),
    ...(spec.bridge && { bridge: read(`${key}.bridge`) }),
  };
}

/** `read` is a translator namespaced to the Slide itself (`episodes.<ep>.slides.<slide>`). */
export function slideContext(
  read: ReadString,
  spec: SlideContextSpec,
): { notes: SpeakerNoteItem[]; voiceScript: VoiceScriptSegment[] } {
  return {
    notes: (spec.notes ?? []).map((note) => noteOf(read, note)),
    voiceScript: (spec.segments ?? []).map((segment) => segmentOf(read, segment)),
  };
}
