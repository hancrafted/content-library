import { localizePath, type Locale } from '@/shared/lib/locale.pure';
import type { RemainingTemplates } from '@/shared/lib/speaking-time.pure';
import type { TocPageContext } from '@/shared/lib/table-of-contents.pure';
import { cn } from '@/shared/lib/utils';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { MouseEvent, ReactNode } from 'react';

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
  backToTop: string;
  options: string;
  zoomOut: string;
  zoomIn: string;
}

interface HeadingDetailsProps {
  labels: TocLabels;
  locale: Locale;
  page: TocPageContext;
  topId: string;
  atTop: boolean;
  onGlide: (event: MouseEvent<HTMLAnchorElement>, id: string) => void;
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
      className={cn(
        'inline-flex min-h-11 min-w-0 items-center gap-2 rounded-lg px-2 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-2 md:min-h-8',
        props.collapsed ? 'w-8 shrink-0 justify-center px-0' : 'flex-1',
      )}
    >
      <ArrowLeft aria-hidden className="size-4 shrink-0" />
      <span className={props.collapsed ? 'hidden' : 'truncate'}>{back.label}</span>
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
  collapsed?: boolean;
  actions: ReactNode;
}) {
  const { collapsed } = props;
  return (
    <div data-toc-context className="shrink-0 text-caption text-muted-foreground">
      <div className={cn('mb-2 flex items-center justify-between gap-1', collapsed && 'flex-col-reverse')}>
        <BackLink {...props} />
        <div className={cn('ml-auto flex shrink-0 items-center gap-1', collapsed && 'mx-auto flex-col-reverse')}>
          {props.actions}
        </div>
      </div>
      <HeadingDetails {...props} />
    </div>
  );
}
