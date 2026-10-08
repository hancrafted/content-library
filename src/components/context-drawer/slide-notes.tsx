import type { SpeakerNoteItem } from '@/lib/context-drawer.pure';
import Image from 'next/image';
import type { ContextLabels } from './context-labels';

function Sources({ sources, label }: { sources: readonly string[]; label: string }) {
  return (
    <div className="mt-2 text-xs text-muted-foreground">
      <span className="font-medium">{label}</span>
      <ul className="mt-1 flex flex-col gap-1">
        {sources.map((source) => (
          <li key={source} className="break-all select-text">
            {source}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Note({ note, labels }: { note: SpeakerNoteItem; labels: ContextLabels }) {
  return (
    <li data-note-target={note.target} className="flex flex-col gap-1 break-inside-avoid border-t pt-3">
      <h6 className="text-sm font-semibold">{note.header}</h6>
      <p className="text-sm leading-relaxed">{note.description}</p>
      {note.image && (
        <Image
          src={note.image.src}
          alt={note.image.alt}
          width={0}
          height={0}
          sizes="26rem"
          unoptimized
          className="mt-2 h-auto w-full rounded-md"
        />
      )}
      {note.sources && <Sources sources={note.sources} label={labels.sources} />}
    </li>
  );
}

/** One Slide's Speaker notes, or the empty state. Server-rendered into the page (FE-010 §2). */
export function SlideNotes({ notes, labels }: { notes: readonly SpeakerNoteItem[]; labels: ContextLabels }) {
  if (notes.length === 0) return <p className="text-sm text-muted-foreground">{labels.empty.notes}</p>;
  return (
    <ol className="flex flex-col gap-3">
      {notes.map((note) => (
        <Note key={note.slug} note={note} labels={labels} />
      ))}
    </ol>
  );
}
