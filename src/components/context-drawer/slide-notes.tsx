import type { SpeakerNoteItem } from '@/lib/context-drawer.pure';
import { externalHref } from '@/lib/external-link.pure';
import { ChevronRight, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import type { ContextLabels } from './context-labels';
import { FLAT_ITEM, FLAT_LIST } from './flat-list';

/**
 * Closed by default: sources are reference, not reading. A native `<details>`
 * keeps the text in the HTML; the drawer opens them for print (FE-010 §9).
 */
function Sources({ sources, labels }: { sources: readonly string[]; labels: ContextLabels }) {
  return (
    <details className="group text-xs text-muted-foreground">
      <summary className="inline-flex cursor-pointer items-center gap-1 rounded-md py-1 font-medium select-none marker:content-none hover:text-foreground [&::-webkit-details-marker]:hidden">
        <ChevronRight
          aria-hidden
          className="size-3.5 transition-transform group-open:rotate-90 motion-reduce:transition-none"
        />
        {labels.sources(sources.length)}
      </summary>
      <ul className="mt-1 flex flex-col gap-1.5 border-l pl-3">
        {sources.map((source) => (
          <li key={source} className="break-all">
            <a
              {...{ href: externalHref(source) }}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-start gap-1 underline underline-offset-2 hover:text-foreground"
            >
              <span>{source}</span>
              <ExternalLink aria-hidden className="mt-0.5 size-3 shrink-0" />
              <span className="sr-only">({labels.opensInNewTab})</span>
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}

function Note({ note, labels }: { note: SpeakerNoteItem; labels: ContextLabels }) {
  return (
    <li data-note-target={note.target} className={FLAT_ITEM}>
      <h6 className="text-base leading-snug font-semibold text-pretty">{note.header}</h6>
      <p className="text-sm leading-relaxed text-muted-foreground">{note.description}</p>
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
      {notes.map((note) => (
        <Note key={note.slug} note={note} labels={labels} />
      ))}
    </ol>
  );
}
