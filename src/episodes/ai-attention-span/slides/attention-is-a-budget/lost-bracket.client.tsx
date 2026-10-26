'use client';

import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { middleBand, type Box } from './middle-band.pure';

/** Where the band sits until it is measured: roughly the middle of the attention card. */
const FALLBACK = { top: '35%', height: '30%' };

const boxesOf = (rows: Iterable<Element>, origin: number): Box[] =>
  Array.from(rows, (row) => {
    const rect = row.getBoundingClientRect();
    return { top: rect.top - origin, height: rect.height };
  });

interface Band {
  readonly top: string;
  readonly height: string;
}

/** The measured band of the host's attention rows, re-measured on resize and when the list's rows change. */
function useBand(root: RefObject<HTMLDivElement | null>): Band {
  const [band, setBand] = useState<Band>(FALLBACK);
  useEffect(() => {
    const host = root.current?.closest('[data-lost-host]');
    const list = host?.querySelector('[data-layout]');
    if (!host || !list) return;
    const measure = () => {
      const origin = root.current?.getBoundingClientRect().top ?? 0;
      const found = middleBand(
        boxesOf(list.querySelectorAll('[data-row]'), origin),
        boxesOf(list.querySelectorAll('[data-attention-bucket="middle"]'), origin),
      );
      setBand(found ? { top: `${found.top}px`, height: `${found.height}px` } : FALLBACK);
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(host);
    resize.observe(list);
    const mutation = new MutationObserver(measure);
    mutation.observe(list, { childList: true });
    return () => {
      resize.disconnect();
      mutation.disconnect();
    };
  }, [root]);
  return band;
}

/** A right-pointing curly brace stretched over the band's height. */
function Bracket() {
  return (
    <svg
      data-lost-bracket=""
      aria-hidden="true"
      viewBox="0 0 12 100"
      preserveAspectRatio="none"
      className="hidden h-full w-3 shrink-0 text-primary @3xl:block"
    >
      <path
        d="M0 1 Q6 1 6 10 L6 40 Q6 50 12 50 Q6 50 6 60 L6 90 Q6 99 0 99"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * The "Lost in the middle" bracket and card: a curly bracket spans the attention list's middle rows (those marked
 * `data-attention-bucket="middle"`, else the middle third) and the card sits beside it.
 */
export function LostBracket({ children }: { readonly children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const band = useBand(root);

  return (
    <div ref={root} className="relative @3xl:h-full">
      <div
        data-lost-band=""
        className="flex items-center gap-2 @3xl:absolute @3xl:inset-x-0"
        style={{ top: band.top, height: band.height }}
      >
        <Bracket />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
