'use client';

import { Button } from '@/components/ui/button';
import type { PageTokens } from '@/hooks/use-page-tokens';
import { formatChangePrompt } from '@/lib/change-prompt.pure';
import type { TokenSet } from '@/lib/page-tokens';
import { editKey, setEdit, type Change, type Edits } from '@/lib/token-changes.pure';
import type { Theme } from '@/lib/token-discovery.pure';
import { groupGlobalTokens, groupSlideTokens, type TokenGroup } from '@/lib/token-groups.pure';
import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { TokenRow } from './token-row.client';

type Tab = 'global' | 'slide';

interface ListProps {
  scope: TokenSet['scope'];
  theme: Theme;
  edits: Edits;
  onEdit: (next: Edits) => void;
}

function GroupSection({ group, scope, theme, edits, onEdit }: ListProps & { group: TokenGroup }) {
  return (
    <section aria-label={group.label} data-token-group={group.id}>
      <h3 className="bg-card text-muted-foreground border-border sticky top-0 z-10 -mx-3 border-b px-3 py-1.5 text-caption font-semibold">
        {group.label}
      </h3>
      <ul className="divide-border flex flex-col divide-y">
        {group.tokens.map((token) => {
          const key = editKey(scope, theme, token);
          return (
            <TokenRow
              key={key}
              token={token}
              theme={theme}
              value={edits[key] ?? token[theme]}
              changed={key in edits}
              onChange={(value) => onEdit(setEdit(edits, { scope, theme, token }, value))}
            />
          );
        })}
      </ul>
    </section>
  );
}

function TokenGroups({ set, tab, ...list }: Omit<ListProps, 'scope'> & { set: TokenSet | undefined; tab: Tab }) {
  if (!set || set.tokens.length === 0) return <p className="text-muted-foreground text-caption">No tokens here.</p>;
  const groups = tab === 'global' ? groupGlobalTokens(set.tokens) : groupSlideTokens(set.tokens);
  return groups.map((group) => <GroupSection key={group.id} group={group} scope={set.scope} {...list} />);
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

function TabButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <Button
      size="sm"
      variant={active ? 'default' : 'outline'}
      role="tab"
      aria-selected={active}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function PanelHeader({
  shown,
  slideId,
  theme,
  onTab,
}: {
  shown: Tab;
  slideId: string | null;
  theme: Theme;
  onTab: (tab: Tab) => void;
}) {
  const ThemeIcon = theme === 'dark' ? Moon : Sun;
  return (
    <div className="flex items-center justify-between gap-2">
      <div role="tablist" aria-label="Token scope" className="flex items-center gap-2">
        <TabButton active={shown === 'global'} onClick={() => onTab('global')}>
          Global
        </TabButton>
        <TabButton active={shown === 'slide'} disabled={!slideId} onClick={() => onTab('slide')}>
          {slideId ? `Slide: ${slideId}` : 'Slide'}
        </TabButton>
      </div>
      <span className="text-muted-foreground flex items-center gap-1.5" title="Edits change this theme's values">
        <ThemeIcon aria-hidden className="size-4" />
        {theme} values
      </span>
    </div>
  );
}

export interface PanelProps {
  theme: Theme;
  /** The page's tokens; `currentSlide` is `null` off an Episode page, where the Slide tab is off. */
  tokens: PageTokens;
  edits: Edits;
  changes: Change[];
  onEdits: (next: Edits) => void;
  top: number;
}

/**
 * The popover body: scope tabs, the grouped token list for the active theme, and
 * the copy and reset actions. Always dark (the `dark` class), whatever the site's
 * theme, so it reads the same while a theme's tokens are being edited.
 */
export function TokenPanel({ theme, tokens, edits, changes, onEdits, top }: PanelProps) {
  const [tab, setTab] = useState<Tab>('global');
  const slideId = tokens.currentSlide;
  const shown: Tab = tab === 'slide' && slideId ? 'slide' : 'global';
  return (
    <div
      role="dialog"
      aria-label="Design-system token editor"
      data-testid="design-system-token-panel"
      style={{ top, maxHeight: `calc(100svh - ${top}px - 1rem)` }}
      className={
        'dark bg-card text-card-foreground border-border fixed z-60 flex w-[min(28rem,calc(100vw-2rem))] flex-col gap-3 rounded-xl border p-3 text-caption shadow-header right-4 max-sm:left-4'
      }
    >
      <PanelHeader shown={shown} slideId={slideId} theme={theme} onTab={setTab} />
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 -mx-3" data-testid="token-scroll">
        <TokenGroups
          set={shown === 'global' ? tokens.globals : slideId ? tokens.slides[slideId] : undefined}
          tab={shown}
          theme={theme}
          edits={edits}
          onEdit={onEdits}
        />
      </div>
      <Actions changes={changes} onReset={() => onEdits({})} />
    </div>
  );
}
