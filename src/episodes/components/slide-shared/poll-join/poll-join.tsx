import { isPlaceholderPollUrl, qrModules } from './qr-modules.pure';

/** What `PollJoin` takes: the Vote link and the words around its code. */
export interface PollJoinProps {
  /** The directpoll Vote link; the QR is drawn from it at build time. */
  voteUrl: string;
  /** The caption under the code: "Scan to vote". */
  label: string;
  /** The accessible name of the code. */
  qrLabel: string;
  /** Shown instead of a code while `voteUrl` is a placeholder: "Create your poll at directpoll.com". */
  note: string;
}

/** The longest link a person types from a screen without giving up; a directpoll token link is far longer. */
const TYPEABLE_LENGTH = 40;

/** The link as people read it aloud or type it: no scheme; none when it is too long to type, so only the code shows. */
function shortLink(url: string): string | undefined {
  const short = url.replace(/^https?:\/\//, '');
  return short.length <= TYPEABLE_LENGTH ? short : undefined;
}

/** Shown while the Vote link is a placeholder: the note, on the panel the code would sit on. */
function Placeholder({ note }: { note: string }) {
  return (
    <p
      data-poll-join="placeholder"
      className="rounded-xl border border-dashed border-primary-foreground/50 p-6 text-center text-body font-semibold"
    >
      {note}
    </p>
  );
}

/** The QR on its tile, as an inline SVG with its accessible name: dark modules on a light tile in both themes, since many phone cameras cannot read an inverted code. */
function QrTile({ voteUrl, qrLabel }: Pick<PollJoinProps, 'voteUrl' | 'qrLabel'>) {
  const { size, path } = qrModules(voteUrl);
  return (
    <div className="rounded-xl bg-card p-3 shadow-lg dark:bg-foreground">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="size-56"
        role="img"
        aria-label={qrLabel}
        shapeRendering="crispEdges"
      >
        <path d={path} className="fill-foreground dark:fill-background" />
      </svg>
    </div>
  );
}

/**
 * The way into a poll (a server part): a QR drawn at build time as an inline SVG from the Vote link, on a light tile so
 * it scans in both themes, the caption and, when short enough to type, the link under it. A placeholder link shows the note instead, so a
 * template copy never prints a code that scans to nothing. No request leaves the page.
 */
export function PollJoin({ voteUrl, label, qrLabel, note }: PollJoinProps) {
  if (isPlaceholderPollUrl(voteUrl)) return <Placeholder note={note} />;
  const link = shortLink(voteUrl);
  return (
    <div data-poll-join="qr" className="flex flex-col items-center gap-5">
      <QrTile voteUrl={voteUrl} qrLabel={qrLabel} />
      <p className="text-caption tracking-widest uppercase opacity-80">{label}</p>
      {link !== undefined && (
        <p className="rounded-full bg-primary-foreground/15 px-5 py-2 font-mono text-body font-semibold">{link}</p>
      )}
    </div>
  );
}
