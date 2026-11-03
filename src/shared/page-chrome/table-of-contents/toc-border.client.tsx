'use client';

import type { Locale } from '@/shared/lib/locale.pure';
import { hasReadingTime, remainingLabel } from '@/shared/lib/speaking-time.pure';
import type { ReadingTime } from '@/shared/lib/table-of-contents.pure';
import { cn } from '@/shared/lib/utils';
import { useLayoutEffect, useRef, useState } from 'react';
import type { TocLabels } from './toc-heading';

interface BorderProps {
  labels: TocLabels;
  locale: Locale;
  time: ReadingTime;
  settled: boolean;
}

/** A clockwise rounded rectangle whose first point is always the top centre. */
function outlinePath(width: number, height: number): string {
  if (width <= 2 || height <= 2) return '';
  const right = width - 1;
  const bottom = height - 1;
  const r = Math.min(15, (width - 2) / 2, (height - 2) / 2);
  return [
    `M ${width / 2} 1 H ${right - r}`,
    `A ${r} ${r} 0 0 1 ${right} ${1 + r} V ${bottom - r}`,
    `A ${r} ${r} 0 0 1 ${right - r} ${bottom} H ${1 + r}`,
    `A ${r} ${r} 0 0 1 1 ${bottom - r} V ${1 + r}`,
    `A ${r} ${r} 0 0 1 ${1 + r} 1 H ${width / 2} Z`,
  ].join(' ');
}

function useOutline() {
  const ref = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, path: outlinePath(size.width, size.height) };
}

function BorderStroke(props: { path: string; progress: number; settled: boolean }) {
  return (
    <path
      d={props.path}
      pathLength={100}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeDasharray={100}
      strokeDashoffset={(1 - props.progress) * 100}
      className={cn(
        'motion-reduce:transition-none',
        props.settled && 'transition-[stroke-dashoffset] duration-300 ease-out',
      )}
    />
  );
}

export function TocBorder(props: BorderProps) {
  const outline = useOutline();
  const progress = Math.max(0, Math.min(1, props.time.progress));
  return (
    <svg
      ref={outline.ref}
      data-toc-border
      role="progressbar"
      aria-label={props.labels.progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      aria-valuetext={
        hasReadingTime(props.time.total)
          ? remainingLabel(props.labels.remaining, props.locale, props.time.remaining)
          : undefined
      }
      data-complete={progress >= 1 ? 'true' : undefined}
      className={cn(
        'pointer-events-none absolute -inset-px h-[calc(100%+2px)] w-[calc(100%+2px)] overflow-visible print:hidden motion-reduce:transition-none',
        props.settled && 'transition-colors duration-300 ease-out',
        progress >= 1 ? 'text-(--success)' : 'text-foreground',
      )}
    >
      <BorderStroke path={outline.path} progress={progress} settled={props.settled} />
    </svg>
  );
}
