'use client';

import type { Scope } from '@/shared/lib/token-changes.pure';
import type { Theme, Token } from '@/shared/lib/token-discovery.pure';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { findTokenUsage, outlineElement, scrollToElement, type UsageHit } from './token-usage';

type Usage = { state: 'idle' } | { state: 'running' } | { state: 'done'; hits: UsageHit[] };

/** Runs the lookup on demand, drops a late answer after unmount, and clears the outline when the row goes. */
function useUsage(scope: Scope, token: Token, theme: Theme) {
  const [usage, setUsage] = useState<Usage>({ state: 'idle' });
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      outlineElement(null);
    };
  }, []);
  const find = () => {
    setUsage({ state: 'running' });
    void findTokenUsage(scope, token, theme).then((hits) => {
      if (alive.current) setUsage({ state: 'done', hits });
    });
  };
  return { usage, find };
}

function HitList({ hits }: { hits: UsageHit[] }) {
  if (hits.length === 0) {
    return <p className="text-muted-foreground text-caption">Nothing in view uses this token.</p>;
  }
  return (
    <ul
      className="border-border flex max-h-44 flex-col overflow-y-auto rounded-md border"
      data-testid="token-usage-list"
    >
      {hits.map((hit, index) => (
        <li key={index}>
          <button
            type="button"
            data-token-usage-hit
            onMouseEnter={() => outlineElement(hit.element)}
            onFocus={() => outlineElement(hit.element)}
            onMouseLeave={() => outlineElement(null)}
            onBlur={() => outlineElement(null)}
            onClick={() => scrollToElement(hit.element)}
            className="hover:bg-accent focus-visible:bg-accent flex w-full cursor-pointer flex-col items-start gap-0.5 px-2 py-1 text-left outline-none"
          >
            <span className="font-mono text-caption">{hit.label}</span>
            <span className="text-muted-foreground text-caption">{hit.properties.join(', ')}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/**
 * A "Find usage" button under a token. It finds the elements in view that use the
 * token and lists them: hover outlines one, click scrolls to it. Nothing runs
 * until the button is pressed.
 */
export function TokenUsage({ scope, token, theme }: { scope: Scope; token: Token; theme: Theme }) {
  const { usage, find } = useUsage(scope, token, theme);
  const [open, setOpen] = useState(true);
  const hits = usage.state === 'done' ? usage.hits : null;
  return (
    <div className="flex flex-col gap-1.5" data-testid="token-usage">
      <div className="flex items-center gap-2">
        <FindButton
          state={usage.state}
          onFind={() => {
            setOpen(true);
            find();
          }}
        />
        {hits && <CountToggle count={hits.length} open={open} onToggle={() => setOpen((o) => !o)} />}
      </div>
      {hits && open && <HitList hits={hits} />}
    </div>
  );
}

function FindButton({ state, onFind }: { state: Usage['state']; onFind: () => void }) {
  const label = { idle: 'Find usage', running: 'Finding...', done: 'Find again' }[state];
  return (
    <button
      type="button"
      onClick={onFind}
      disabled={state === 'running'}
      className="border-input hover:bg-accent focus-visible:ring-ring flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-caption outline-none focus-visible:ring-2 disabled:cursor-progress disabled:opacity-60"
    >
      <Search aria-hidden className="size-3.5" />
      {label}
    </button>
  );
}

function CountToggle({ count, open, onToggle }: { count: number; open: boolean; onToggle: () => void }) {
  const Chevron = open ? ChevronDown : ChevronRight;
  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={onToggle}
      className="text-muted-foreground flex cursor-pointer items-center gap-1 text-caption outline-none focus-visible:underline"
    >
      <Chevron aria-hidden className="size-3.5" />
      {count} in view
    </button>
  );
}
