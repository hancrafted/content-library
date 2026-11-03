import { localizePath, type Locale } from '@/shared/lib/locale.pure';
import { hasReadingTime, remainingLabel, type RemainingTemplates } from '@/shared/lib/speaking-time.pure';
import type { ReadingTime, TocPageContext } from '@/shared/lib/table-of-contents.pure';
import { cn } from '@/shared/lib/utils';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { MouseEvent, ReactNode } from 'react';

export interface TocLabels {
  title: string;
  episode: string;
  progress: string;
  /** Time left, per plural category; `{count}` stands for the whole minutes. */
  remaining: RemainingTemplates;
  toggle: string;
  loading: string;
  open: string;
  close: string;
  collapse: string;
  expand: string;
  backToTop: string;
  options: string;
  presentation: string;
  showAsTree: string;
  zoomOut: string;
  zoomIn: string;
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

interface HeadingDetailsProps {
  labels: TocLabels;
  locale: Locale;
  page: TocPageContext;
  topId: string;
  atTop: boolean;
  onGlide: (event: MouseEvent<HTMLAnchorElement>, id: string) => void;
  time: ReadingTime;
  revealed: boolean;
  collapsed?: boolean;
}

function HeadingDetails(props: HeadingDetailsProps) {
  const { collapsed } = props;
  return (
    <div
      aria-hidden={collapsed}
      inert={collapsed}
      className={cn('min-w-0 overflow-hidden px-2 text-left', collapsed ? 'h-0 opacity-0' : 'pb-3 opacity-100')}
    >
      <Link
        href={localizePath(props.page.route, props.locale, props.topId)}
        replace
        onClick={(event) => props.onGlide(event, props.topId)}
        aria-current={props.atTop ? 'location' : undefined}
        data-testid="toc-top"
        className="block rounded text-pretty font-medium text-foreground hover:underline focus-visible:outline-2"
      >
        {props.page.title}
      </Link>
      <div className="mt-1 text-muted-foreground">
        <TimeLeft {...props} />
      </div>
    </div>
  );
}

function BackLink(props: Pick<HeadingDetailsProps, 'page' | 'locale' | 'collapsed'>) {
  const back = props.page.back;
  if (!back) return null;
  return (
    <Link
      href={localizePath(back.route, props.locale)}
      aria-label={back.label}
      title={back.label}
      data-testid="toc-back"
      className="inline-flex min-h-8 min-w-8 items-center gap-2 rounded-lg px-2 font-medium tracking-widest uppercase hover:bg-accent hover:text-foreground focus-visible:outline-2"
    >
      <ArrowLeft aria-hidden className="size-4 shrink-0" />
      {!props.collapsed && <span>{back.label}</span>}
    </Link>
  );
}

/** Navigation out of the page above its own title, which returns to the document start. */
export function TocHeading(props: {
  labels: TocLabels;
  locale: Locale;
  page: TocPageContext;
  topId: string;
  atTop: boolean;
  onGlide: (event: MouseEvent<HTMLAnchorElement>, id: string) => void;
  time: ReadingTime;
  revealed: boolean;
  collapsed?: boolean;
  actions: ReactNode;
}) {
  const { collapsed } = props;
  return (
    <div data-toc-context className="shrink-0 text-caption text-muted-foreground">
      <div className={cn('mb-2 flex items-center justify-between gap-1', collapsed && 'flex-col-reverse')}>
        <BackLink {...props} />
        <div className={cn('ml-auto', collapsed && 'mx-auto')}>{props.actions}</div>
      </div>
      <HeadingDetails {...props} />
    </div>
  );
}
