import { localizePath, type Locale } from '@/shared/lib/locale.pure';
import { hasReadingTime, remainingLabel, wholeMinutes, type RemainingTemplates } from '@/shared/lib/speaking-time.pure';
import type { ReadingTime } from '@/shared/lib/table-of-contents.pure';
import { cn } from '@/shared/lib/utils';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import Link from 'next/link';
import type { MouseEvent } from 'react';

export interface TocLabels {
  title: string;
  progress: string;
  /** Time left, per plural category; `{count}` stands for the whole minutes. */
  remaining: RemainingTemplates;
  toggle: string;
  loading: string;
  open: string;
  close: string;
  collapse: string;
  expand: string;
}

/** Time left, kept in the HTML for a reader without JavaScript; nothing for an Episode without a Voice script. */
function TimeLeft(props: { labels: TocLabels; locale: Locale; time: ReadingTime; revealed: boolean }) {
  if (!hasReadingTime(props.time.total)) return null;
  return (
    <span className={cn('tabular-nums', !props.revealed && 'hidden noscript:inline')}>
      {remainingLabel(props.labels.remaining, props.locale, props.time.remaining)}
    </span>
  );
}

function CollapsedHeading({ labels, onToggleCollapse }: { labels: TocLabels; onToggleCollapse?: () => void }) {
  return (
    <div className="flex items-center justify-center p-0.5 text-muted-foreground">
      {onToggleCollapse && (
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={labels.expand}
          title={labels.expand}
          data-testid="toc-collapse-toggle"
          className="grid size-8 cursor-pointer place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:ring-ring"
        >
          <PanelLeftOpen aria-hidden className="size-4" />
        </button>
      )}
    </div>
  );
}

function CollapseToggleButton({ labels, onToggleCollapse }: { labels: TocLabels; onToggleCollapse?: () => void }) {
  if (!onToggleCollapse) return null;
  return (
    <button
      type="button"
      onClick={onToggleCollapse}
      aria-label={labels.collapse}
      title={labels.collapse}
      data-testid="toc-collapse-toggle"
      className="grid size-6 cursor-pointer place-items-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:ring-ring"
    >
      <PanelLeftClose aria-hidden className="size-4" />
    </button>
  );
}

interface ExpandedHeadingProps {
  labels: TocLabels;
  locale: Locale;
  route: string;
  topId: string;
  atTop: boolean;
  onGlide: (event: MouseEvent<HTMLAnchorElement>, id: string) => void;
  time: ReadingTime;
  revealed: boolean;
  onToggleCollapse?: () => void;
}

function ExpandedHeading(props: ExpandedHeadingProps) {
  const { labels, onToggleCollapse } = props;
  return (
    <div className="flex items-center justify-between gap-2 px-2 text-caption whitespace-nowrap text-muted-foreground">
      <Link
        href={localizePath(props.route, props.locale, props.topId)}
        replace
        onClick={(event) => props.onGlide(event, props.topId)}
        aria-current={props.atTop ? 'location' : undefined}
        data-testid="toc-top"
        className="rounded font-medium tracking-widest uppercase hover:text-foreground focus-visible:outline-2"
      >
        {labels.title}
      </Link>
      <div className="flex items-center gap-1.5">
        {props.revealed ? null : <span className="animate-pulse noscript:hidden">{labels.loading}</span>}
        <TimeLeft {...props} />
        <CollapseToggleButton labels={labels} onToggleCollapse={onToggleCollapse} />
      </div>
    </div>
  );
}

/**
 * Title on the left, a link to the top of the page (the Title slide), current
 * while the reader is there; time left and the collapse toggle on the right,
 * or "Loading" while the box masks the first settle. When collapsed, only
 * the expand toggle is shown.
 */
export function TocHeading(props: {
  labels: TocLabels;
  locale: Locale;
  route: string;
  topId: string;
  atTop: boolean;
  onGlide: (event: MouseEvent<HTMLAnchorElement>, id: string) => void;
  time: ReadingTime;
  revealed: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  if (props.collapsed) {
    return <CollapsedHeading labels={props.labels} onToggleCollapse={props.onToggleCollapse} />;
  }
  return <ExpandedHeading {...props} />;
}

/** The time-weighted progress bar beneath the heading; only its spacing where the Episode has no Voice script. */
export function ProgressBar(props: { labels: TocLabels; locale: Locale; time: ReadingTime; settled: boolean }) {
  const { time } = props;
  if (!hasReadingTime(time.total)) return <div className="mb-3" />;
  return (
    <div
      role="progressbar"
      aria-label={props.labels.progress}
      aria-valuemin={0}
      aria-valuemax={wholeMinutes(time.total)}
      aria-valuenow={Math.round(time.total - time.remaining)}
      aria-valuetext={remainingLabel(props.labels.remaining, props.locale, time.remaining)}
      className="mx-2 mt-2 mb-3 h-1 shrink-0 overflow-hidden rounded-full bg-border"
    >
      <div
        className={cn(
          'h-full origin-left rounded-full bg-foreground motion-reduce:transition-none',
          props.settled ? 'transition-transform duration-300 ease-out' : 'transition-none',
        )}
        style={{ transform: `scaleX(${time.progress})` }}
      />
    </div>
  );
}
