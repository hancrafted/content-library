import {
  sourceDomain,
  splitCitations,
  type NoteSource,
  type ResearchSource,
  type SpeakerNoteItem,
  type UrlSource,
} from '@/lib/context-drawer.pure';
import { CITATION_ATTR, NOTE_TARGET_ATTR, SOURCE_ATTR } from '@/lib/context-link.pure';
import { externalHref } from '@/lib/external-link.pure';
import { localizePath } from '@/lib/locale.pure';
import { ChevronRight, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import type { ContextDrawerLabels } from './context-drawer-input';
import { DrawerExplainer } from './drawer-explainer';
import { FLAT_ITEM, FLAT_LIST } from './flat-list';

/*
 * A citation marker, the only superscript in the drawer: a small, tabular
 * number in the body font. A button defaults to the system font, so `font:
 * inherit` hands it the body's. The hit area grows by a pseudo-element, which
 * takes no layout space; the ring shows on keyboard focus only.
 */
const CITATION =
  "relative inline-block cursor-pointer rounded-sm px-px [font:inherit] text-foreground after:absolute after:-inset-1.5 after:content-[''] hover:bg-accent focus-visible:outline-2 print:cursor-auto print:hover:bg-transparent";

/** A citation marker: a superscript button the drawer's delegated click turns into "open source n". Plain text in print. */
function Citation({ number, labels }: { number: number; labels: ContextDrawerLabels }) {
  return (
    <sup className="mx-px align-super text-[0.7em] leading-none tabular-nums">
      <button type="button" {...{ [CITATION_ATTR]: number }} aria-label={labels.citation(number)} className={CITATION}>
        {number}
      </button>
    </sup>
  );
}

/** The description with its `[n]` markers turned into citation buttons. */
function Description({ text, labels }: { text: string; labels: ContextDrawerLabels }) {
  return (
    <p className="text-body leading-relaxed text-muted-foreground">
      {splitCitations(text).map((part, at) =>
        typeof part === 'string' ? part : <Citation key={at} number={part.cite} labels={labels} />,
      )}
    </p>
  );
}

const SOURCE_LINK =
  'inline-flex items-start gap-1 underline underline-offset-2 hover:text-foreground focus-visible:outline-2';

/** A Source cited directly: a link out, in a new tab, with its host below. */
function UrlSourceBody({ source, labels }: { source: UrlSource; labels: ContextDrawerLabels }) {
  return (
    <>
      <a href={externalHref(source.url)} target="_blank" rel="noopener noreferrer" className={SOURCE_LINK}>
        <span data-source-title>{source.title}</span>
        <ExternalLink aria-hidden className="mt-0.5 size-3 shrink-0" />
        <span className="sr-only">({labels.strings.opensInNewTab})</span>
      </a>
      <span className="block text-body opacity-80">{sourceDomain(source.url)}</span>
    </>
  );
}

/**
 * A cited Research question: the question as a link to its page on this site, then its id and how settled its
 * Answer is. A staged question has no page until Promotion, so its title stands without a link.
 */
function ResearchSourceBody({ source, labels }: { source: ResearchSource; labels: ContextDrawerLabels }) {
  const title = <span data-source-title>{source.title}</span>;
  return (
    <>
      {source.page ? (
        <a href={localizePath(source.page.path, source.page.locale)} className={SOURCE_LINK}>
          {title}
        </a>
      ) : (
        title
      )}
      <span className="block text-body opacity-80">
        {labels.strings.researchQuestion} {source.research} ·{' '}
        <span data-confidence={source.confidence} className="font-medium">
          {labels.strings.confidence[source.confidence]}
        </span>
      </span>
    </>
  );
}

function Source({ source, number, labels }: { source: NoteSource; number: number; labels: ContextDrawerLabels }) {
  return (
    <li {...{ [SOURCE_ATTR]: number }} className="pl-1">
      {source.research === undefined ? (
        <UrlSourceBody source={source} labels={labels} />
      ) : (
        <ResearchSourceBody source={source} labels={labels} />
      )}
    </li>
  );
}

/**
 * Closed by default: sources are reference, not reading. A native `<details>`
 * keeps the text in the HTML; the drawer opens them for print (FE-010 §2). The
 * numbered list is what a description's `[n]` markers point into.
 */
function Sources({ sources, labels }: { sources: readonly NoteSource[]; labels: ContextDrawerLabels }) {
  return (
    <details className="group text-body text-muted-foreground">
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

function Note({ note, labels }: { note: SpeakerNoteItem; labels: ContextDrawerLabels }) {
  return (
    <li {...{ [NOTE_TARGET_ATTR]: note.target }} data-note={note.slug} className={FLAT_ITEM}>
      <h6 className="text-body leading-snug font-semibold text-pretty">{note.header}</h6>
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

/** One Slide's Speaker notes, its explainer, or the empty state. Server-rendered into the page (FE-010 §2). */
export function SlideNotes({
  notes,
  labels,
  explainer,
}: {
  notes: readonly SpeakerNoteItem[];
  labels: ContextDrawerLabels;
  explainer?: string;
}) {
  if (explainer !== undefined) return <DrawerExplainer text={explainer} />;
  if (notes.length === 0) return <p className="text-body text-muted-foreground">{labels.strings.empty.notes}</p>;
  return (
    <ol className={FLAT_LIST}>
      {notes.map((note) => (
        <Note key={note.slug} note={note} labels={labels} />
      ))}
    </ol>
  );
}
