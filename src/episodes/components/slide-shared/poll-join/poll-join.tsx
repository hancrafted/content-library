import { externalHref } from '@/shared/lib/external-link.pure';
import { ExternalLink } from 'lucide-react';
import { isPlaceholderPollUrl, qrModules } from './qr-modules.pure';

export interface PollJoinProps {
  voteUrl: string;
  label: string;
  qrLabel: string;
  note: string;
  openLabel: string;
  newTab: string;
}

const TYPEABLE_LENGTH = 40;

function shortLink(url: string): string | undefined {
  const short = url.replace(/^https?:\/\//, '');
  return short.length <= TYPEABLE_LENGTH ? short : undefined;
}

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

function VoteLink({ voteUrl, openLabel, newTab }: Pick<PollJoinProps, 'voteUrl' | 'openLabel' | 'newTab'>) {
  return (
    <a
      data-poll-open=""
      href={externalHref(voteUrl)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary-foreground px-5 py-2 text-body font-semibold text-primary shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground motion-reduce:transition-none"
    >
      {openLabel}
      <ExternalLink aria-hidden className="size-4" />
      <span className="sr-only">({newTab})</span>
    </a>
  );
}

export function PollJoin({ voteUrl, label, qrLabel, note, openLabel, newTab }: PollJoinProps) {
  if (isPlaceholderPollUrl(voteUrl)) return <Placeholder note={note} />;
  const link = shortLink(voteUrl);
  return (
    <div data-poll-join="qr" className="flex flex-col items-center gap-5">
      <QrTile voteUrl={voteUrl} qrLabel={qrLabel} />
      <p className="text-caption tracking-widest uppercase opacity-80">{label}</p>
      {link !== undefined && (
        <p className="rounded-full bg-primary-foreground/15 px-5 py-2 font-mono text-body font-semibold">{link}</p>
      )}
      <VoteLink voteUrl={voteUrl} openLabel={openLabel} newTab={newTab} />
    </div>
  );
}
