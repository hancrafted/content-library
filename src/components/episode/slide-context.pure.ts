import type { SpeakerNoteItem, VoiceScriptSegment } from '@/lib/context-drawer.pure';

/*
 * Builds a Slide's notes and voice script from catalog strings plus the
 * non-localized facts an Episode keeps in the record (FE-010 §8). The output is
 * content records, not markup, so FE-002's "no renderer between a Slide and its
 * markup" does not apply to it.
 */

export interface NoteSpec {
  readonly slug: string;
  readonly target: string;
  readonly sources?: readonly string[];
  readonly image?: { readonly src: string };
}

export interface SegmentSpec {
  readonly slug: string;
  readonly from: number;
  readonly to: number;
  /** True when the catalog holds a `bridge` string for this segment. */
  readonly bridge?: boolean;
}

export interface SlideContextSpec {
  readonly notes?: readonly NoteSpec[];
  readonly segments?: readonly SegmentSpec[];
}

/** Reads one catalog leaf by key, relative to the Episode's namespace. */
export type ReadString = (key: string) => string;

function noteOf(read: ReadString, base: string, spec: NoteSpec): SpeakerNoteItem {
  const key = `${base}.notes.${spec.slug}`;
  return {
    slug: spec.slug,
    header: read(`${key}.header`),
    description: read(`${key}.description`),
    target: spec.target,
    ...(spec.sources && { sources: spec.sources }),
    ...(spec.image && { image: { src: spec.image.src, alt: read(`${key}.image.alt`) } }),
  };
}

function segmentOf(read: ReadString, base: string, spec: SegmentSpec): VoiceScriptSegment {
  const key = `${base}.voiceScript.segments.${spec.slug}`;
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

/** `base` is the Slide's catalog path, e.g. `foundations.slides.why`, or a Section's, e.g. `foundations`. */
export function slideContext(
  read: ReadString,
  base: string,
  spec: SlideContextSpec,
): { notes: SpeakerNoteItem[]; voiceScript: VoiceScriptSegment[] } {
  return {
    notes: (spec.notes ?? []).map((note) => noteOf(read, base, note)),
    voiceScript: (spec.segments ?? []).map((segment) => segmentOf(read, base, segment)),
  };
}
