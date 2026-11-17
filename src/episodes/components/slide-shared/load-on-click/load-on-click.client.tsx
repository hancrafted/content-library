'use client';

import { externalHref } from '@/shared/lib/external-link.pure';
import { useState } from 'react';

export interface LoadOnClickProps {
  src: string;
  buttonLabel: string;
  hint: string;
  fallbackNote: string;
  newTabHint: string;
  title: string;
}

function Gate({ onLoad, buttonLabel, hint }: { onLoad: () => void; buttonLabel: string; hint: string }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <button
        type="button"
        onClick={onLoad}
        className="card-hover card-hover--raise inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-body font-semibold text-primary-foreground shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
          <path
            d="M4 20V10M10 20V4M16 20v-7M22 20H2"
            className="fill-none stroke-current"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        {buttonLabel}
      </button>
      <span className="text-caption text-muted-foreground">{hint}</span>
    </div>
  );
}

function Frame({ src, fallbackNote, newTabHint, title }: Omit<LoadOnClickProps, 'buttonLabel' | 'hint'>) {
  return (
    <div className="flex flex-col gap-2">
      <iframe
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="h-96 w-full rounded-xl border border-border bg-card"
      />
      <a
        href={externalHref(src)}
        target="_blank"
        rel="noopener noreferrer"
        className="w-fit text-caption text-muted-foreground underline underline-offset-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {fallbackNote}
        <span className="sr-only"> ({newTabHint})</span>
      </a>
    </div>
  );
}

export function LoadOnClick({ buttonLabel, hint, ...frame }: LoadOnClickProps) {
  const [loaded, setLoaded] = useState(false);
  if (!loaded) return <Gate onLoad={() => setLoaded(true)} buttonLabel={buttonLabel} hint={hint} />;
  return <Frame {...frame} />;
}
