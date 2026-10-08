import {
  CITATION_ATTR,
  NOTE_TARGET_ATTR,
  sourceDomain,
  splitCitations,
  type NoteSource,
  type SpeakerNoteItem,
} from '@/lib/context-drawer.pure';
import { externalHref } from '@/lib/external-link.pure';
import { ChevronRight, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import type { ContextLabels } from './context-labels';
import { FLAT_ITEM, FLAT_LIST } from './flat-list';

/** A citation marker: a superscript button the drawer's delegated click turns into "open source n". Plain text in print. */
function Citation({ number, labels }: { number: number; labels: ContextLabels }) {
  return (
    <sup className="mx-px">
      <button
        type="button"
        {...{ [CITATION_ATTR]: number }}
        aria-label={labels.citation(number)}
        className="cursor-pointer rounded-sm px-0.5 text-[0.7rem] font-semibold text-foreground underline decoration-dotted underline-offset-2 hover:decoration-solid focus-visible:outline-2 print:cursor-auto print:no-underline"
      >
        {number}
      </button>
    </sup>
  );
}

/** The description with its `[n]` markers turned into citation buttons. */
function Description({ text, labels }: { text: string; labels: ContextLabels }) {
  return (
    <p className="text-sm leading-relaxed text-muted-foreground">
      {splitCitations(text).map((part, at) =>
        typeof part === 'string' ? part : <Citation key={at} number={part.cite} labels={labels} />,
      )}
    </p>
  );
}

function Source({ source, number, labels }: { source: NoteSource; number: number; labels: ContextLabels }) {
  return (
    <li data-source={number} className="pl-1">
      <a
        {...{ href: externalHref(source.url) }}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-start gap-1 underline underline-offset-2 hover:text-foreground focus-visible:outline-2"
      >
        <span>{source.title}</span>
        <ExternalLink aria-hidden className="mt-0.5 size-3 shrink-0" />
        <span className="sr-only">({labels.opensInNewTab})</span>
      </a>
      <span className="block text-[0.7rem] opacity-80">{sourceDomain(source.url)}</span>
    </li>
  );
}

/**
 * Closed by default: sources are reference, not reading. A native `<details>`
 * keeps the text in the HTML; the drawer opens them for print (FE-010 §2). The
 * numbered list is what a description's `[n]` markers point into.
 */
function Sources({ sources, labels }: { sources: readonly NoteSource[]; labels: ContextLabels }) {
  return (
    <details className="group text-xs text-muted-foreground">
      <summary className="inline-flex cursor-pointer items-center gap-1 rounded-md py-1 font-medium select-none marker:content-none hover:text-foreground [&::-webkit-details-marker]:hidden">
        <ChevronRight
          aria-hidden
          className="size-3.5 transition-transform group-open:rotate-90 motion-reduce:transition-none"
        />
        {labels.sources(sources.length)}
      </summary>
      <ol className="mt-1 flex list-decimal flex-col gap-2 border-l pl-7 marker:text-muted-foreground">
        {sources.map((source, at) => (
          <Source key={source.slug} source={source} number={at + 1} labels={labels} />
        ))}
      </ol>
    </details>
  );
}

function Note({ note, number, labels }: { note: SpeakerNoteItem; number: number; labels: ContextLabels }) {
  return (
    <li {...{ [NOTE_TARGET_ATTR]: note.target }} data-note={note.slug} className={FLAT_ITEM}>
      <h6 className="text-base leading-snug font-semibold text-pretty">
        <span aria-hidden className="mr-2 text-sm font-normal text-muted-foreground tabular-nums">
          {number}
        </span>
        {note.header}
      </h6>
      <Description text={note.description} labels={labels} />
      {note.image && (
        <Image
          src={note.image.src}
          alt={note.image.alt}
          width={0}
          height={0}
          sizes="26rem"
          unoptimized
          className="h-auto w-full rounded-lg border"
        />
      )}
      {note.sources && <Sources sources={note.sources} labels={labels} />}
    </li>
  );
}

/** One Slide's Speaker notes, or the empty state. Server-rendered into the page (FE-010 §2). */
export function SlideNotes({ notes, labels }: { notes: readonly SpeakerNoteItem[]; labels: ContextLabels }) {
  if (notes.length === 0) return <p className="text-sm text-muted-foreground">{labels.empty.notes}</p>;
  return (
    <ol className={FLAT_LIST}>
      {notes.map((note, at) => (
        <Note key={note.slug} note={note} number={at + 1} labels={labels} />
      ))}
    </ol>
  );
}
