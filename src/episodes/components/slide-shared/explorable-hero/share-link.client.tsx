'use client';

import { useState } from 'react';

export interface ShareLinkLabels {
  readonly copy: string;
  readonly copied: string;
}

export function ShareLink({ title, text, labels }: { title: string; text: string; labels: ShareLinkLabels }) {
  const [status, setStatus] = useState<string>(text);
  const copy = async () => {
    const url = `${window.location.origin}${window.location.pathname}`;
    try {
      await navigator.clipboard.writeText(url);
      setStatus(labels.copied);
    } catch {
      setStatus(url);
    }
  };
  return (
    <div data-hero-share className="flex flex-wrap items-center gap-x-4 gap-y-3 text-caption">
      <b className="font-semibold">{title}</b>
      <span role="status" className="text-foreground/85">
        {status}
      </span>
      <button
        type="button"
        onClick={copy}
        className="min-h-11 cursor-pointer rounded-full border border-foreground/55 px-4 text-caption text-foreground outline-offset-3 hover:bg-foreground/15 focus-visible:outline-3 focus-visible:outline-foreground"
      >
        {labels.copy}
      </button>
    </div>
  );
}
