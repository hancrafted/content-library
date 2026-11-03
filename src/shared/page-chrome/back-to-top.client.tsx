'use client';

import { useUrlState } from '@/shared/hooks/use-url-state';
import { localizePath, type Locale } from '@/shared/lib/locale.pure';
import { TITLE_ANCHOR } from '@/shared/lib/title-anchor.pure';
import { cn } from '@/shared/lib/utils';
import { ArrowUp } from 'lucide-react';
import Link from 'next/link';
import { useSyncExternalStore, type MouseEvent } from 'react';

function scrollToStart() {
  window.scrollTo({
    top: 0,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  });
}

function useReturnToTop() {
  const url = useUrlState();
  return (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !url) return;
    event.preventDefault();
    url.navigateTo(TITLE_ANCHOR);
    scrollToStart();
  };
}

/** Returns to the document start, including any framing above its Title slide. */
export function BackToTop(props: {
  label: string;
  locale: Locale;
  route: string;
  compact?: boolean;
  className?: string;
}) {
  const onClick = useReturnToTop();
  return (
    <Link
      href={localizePath(props.route, props.locale, TITLE_ANCHOR)}
      data-toc-action
      aria-label={props.label}
      title={props.label}
      onClick={onClick}
      className={cn(
        'inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg text-caption text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-2 md:min-h-8',
        props.compact ? 'size-11 md:size-8' : 'px-2',
        props.className,
      )}
    >
      <ArrowUp aria-hidden className="size-4 shrink-0" />
      {!props.compact && <span>{props.label}</span>}
    </Link>
  );
}

function subscribeToScroll(notify: () => void) {
  window.addEventListener('scroll', notify, { passive: true });
  window.addEventListener('resize', notify);
  return () => {
    window.removeEventListener('scroll', notify);
    window.removeEventListener('resize', notify);
  };
}

const pastStart = () => window.scrollY > window.innerHeight;
const AT_START = () => false;

/** CSS suppresses the fallback wherever page chrome already provides its own action. */
export function SiteBackToTop({ label }: { label: string }) {
  const visible = useSyncExternalStore(subscribeToScroll, pastStart, AT_START);
  if (!visible) return null;
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={scrollToStart}
      className="fixed right-4 bottom-4 z-40 grid size-11 cursor-pointer place-items-center rounded-full border bg-background/80 text-muted-foreground shadow-header backdrop-blur-xl hover:bg-accent hover:text-foreground focus-visible:outline-2 [body:has([data-slot=toc])_&]:hidden print:hidden"
    >
      <ArrowUp aria-hidden className="size-4" />
    </button>
  );
}
