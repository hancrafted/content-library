// An Episode's words as one markdown reading copy (design-ADR 0004: generated on demand, never committed): each
// Section's section slide at h2, its page Slides at h3, each with its caption, Voice script and Speaker notes with
// their sources. Pure: the Slides' i18n messages in Section order in, markdown out; `skills/episode-promote/scripts/episode-text.ts` reads the disk.

interface Segment {
  title?: string;
  /** Read by the Voice script view, never printed here. */
  keywords?: string;
  script?: string;
}

interface Note {
  header?: string;
  description?: string;
  sources?: Record<string, { title?: string }>;
}

/** The keys of a Slide's `i18n/<locale>.json` this copy reads; every other key is on-screen text it leaves out. */
export interface SlideMessages {
  title?: string;
  caption?: string;
  voiceScript?: { segments?: Record<string, Segment> } | null;
  notes?: Record<string, Note> | null;
}

export interface EpisodeWords {
  episode: { title: string; caption?: string };
  /** Each Section's Slides, section slide first. */
  sections: { slug: string; messages: SlideMessages }[][];
}

function voiceScriptLines(segments: readonly Segment[]): string[] {
  if (segments.length === 0) return [];
  return ['**Voice script**', '', ...segments.map(({ title, script }) => `- **${title ?? ''}:** ${script ?? ''}`), ''];
}

function noteLines({ header, description, sources }: Note): string[] {
  const cited = Object.values(sources ?? {}).map(({ title }, index) => `  - [${index + 1}] ${title ?? ''}`);
  return [`- **${header ?? ''}:** ${description ?? ''}`, ...cited];
}

function speakerNoteLines(notes: readonly Note[]): string[] {
  if (notes.length === 0) return [];
  return ['**Speaker notes**', '', ...notes.flatMap(noteLines), ''];
}

function slideText(level: '##' | '###', { slug, messages }: { slug: string; messages: SlideMessages }): string[] {
  if (!messages.title) throw new Error(`Slide ${slug} has no title in its messages`);
  return [
    `${level} ${messages.title} {#${slug}}`,
    '',
    ...(messages.caption ? [messages.caption, ''] : []),
    ...voiceScriptLines(Object.values(messages.voiceScript?.segments ?? {})),
    ...speakerNoteLines(Object.values(messages.notes ?? {})),
  ];
}

export function episodeText({ episode, sections }: EpisodeWords): string {
  const lines = [`# ${episode.title}`, ''];
  if (episode.caption) lines.push(episode.caption, '');
  for (const [sectionSlide, ...pageSlides] of sections) {
    if (sectionSlide !== undefined) lines.push(...slideText('##', sectionSlide));
    for (const slide of pageSlides) lines.push(...slideText('###', slide));
  }
  return lines.join('\n').replace(/\n+$/, '\n');
}
