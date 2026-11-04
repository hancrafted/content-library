import { externalHref } from '@/shared/lib/external-link.pure';

/** The strings the video link reads: its accessible name and the new-tab notice (FE-003 §2.2). */
export interface VideoLabels {
  readonly watchVideo: string;
  readonly newTab: string;
}
const LABELLED =
  'relative z-20 inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-background px-3 py-2 text-caption font-medium text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';
const ICON =
  'relative z-20 -m-2.5 inline-flex size-11 items-center justify-center rounded-full text-youtube transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none motion-reduce:hover:scale-100';

/** A direct YouTube link for a card, raised above the card's stretched title link. */
export function YoutubeLink({
  url,
  labels,
  data,
  labelled = false,
}: {
  url: string | undefined;
  labels: VideoLabels;
  data?: Record<`data-${string}`, string>;
  labelled?: boolean;
}) {
  if (url === undefined) return null;
  return (
    <a
      href={externalHref(url)}
      target="_blank"
      rel="noopener noreferrer"
      {...data}
      data-ink-secondary={labelled ? '' : undefined}
      className={labelled ? LABELLED : ICON}
    >
      <YoutubeLabel labels={labels} labelled={labelled} />
    </a>
  );
}

function YoutubeLabel({ labels, labelled }: { labels: VideoLabels; labelled: boolean }) {
  return (
    <>
      <span data-ink-label={labelled ? '' : undefined} className="inline-flex items-center gap-2">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2C.5 9.1.5 12 .5 12s0 2.9.5 4.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-4.8.5-4.8s0-2.9-.5-4.8ZM9.8 15.2V8.8l5.9 3.2-5.9 3.2Z" />
        </svg>
        {labelled && <span>{labels.watchVideo}</span>}
      </span>
      <span className="sr-only">
        {!labelled && labels.watchVideo} ({labels.newTab})
      </span>
    </>
  );
}
