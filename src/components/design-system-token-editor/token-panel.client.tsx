'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { formatChangePrompt } from './change-prompt.pure';
import type { TokenSet } from './page-tokens';
import { editKey, setEdit, type Change, type Edits } from './token-changes.pure';
import type { Theme } from './token-discovery.pure';
import { TokenRow } from './token-row.client';

type Tab = 'global' | 'slide';

function TokenList({
  set,
  theme,
  edits,
  onEdit,
}: {
  set: TokenSet | undefined;
  theme: Theme;
  edits: Edits;
  onEdit: (next: Edits) => void;
}) {
  if (!set || set.tokens.length === 0) return <li className="text-muted-foreground text-sm">No tokens here.</li>;
  return set.tokens.map((token) => {
    const key = editKey(set.scope, theme, token.name);
    return (
      <TokenRow
        key={token.name}
        token={token}
        theme={theme}
        value={edits[key] ?? token[theme]}
        changed={key in edits}
        onChange={(value) => onEdit(setEdit(edits, { scope: set.scope, theme, token }, value))}
      />
    );
  });
}

function Actions({ changes, onReset }: { changes: Change[]; onReset: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(formatChangePrompt(changes));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex items-center gap-2">
      <Button size="sm" onClick={copy} disabled={changes.length === 0}>
        {copied ? 'Copied' : `Copy changed (${changes.length})`}
      </Button>
      <Button size="sm" variant="outline" onClick={onReset} disabled={changes.length === 0}>
        Reset all
      </Button>
    </div>
  );
}

function Tabs({ tab, slideId, onTab }: { tab: Tab; slideId: string | null; onTab: (tab: Tab) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant={tab === 'global' ? 'default' : 'outline'} onClick={() => onTab('global')}>
        Global
      </Button>
      <Button size="sm" variant={tab === 'slide' ? 'default' : 'outline'} onClick={() => onTab('slide')}>
        {slideId ? `Slide: ${slideId}` : 'Slide'}
      </Button>
    </div>
  );
}

export interface PanelProps {
  theme: Theme;
  globals: TokenSet;
  slide: TokenSet | undefined;
  edits: Edits;
  changes: Change[];
  onEdits: (next: Edits) => void;
}

/** The popover body: scope tabs, the token list for the active theme, and the copy and reset actions. */
export function TokenPanel({ theme, globals, slide, edits, changes, onEdits }: PanelProps) {
  const [tab, setTab] = useState<Tab>('global');
  const slideId = slide?.scope.kind === 'slide' ? slide.scope.id : null;
  return (
    <div
      role="dialog"
      aria-label="Design-system token editor"
      className="bg-card text-card-foreground border-border flex max-h-[70svh] w-[min(26rem,calc(100vw-2rem))] flex-col gap-3 rounded-lg border p-3 shadow-lg"
    >
      <div className="flex items-center justify-between gap-2">
        <Tabs tab={tab} slideId={slideId} onTab={setTab} />
        <span className="text-muted-foreground text-xs">{theme} theme</span>
      </div>
      <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        <TokenList set={tab === 'global' ? globals : slide} theme={theme} edits={edits} onEdit={onEdits} />
      </ul>
      <Actions changes={changes} onReset={() => onEdits({})} />
    </div>
  );
}
