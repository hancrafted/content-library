'use client';

import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import type { PageTokens } from '@/shared/hooks/use-page-tokens';
import { formatChangePrompt } from '@/shared/lib/change-prompt.pure';
import type { TokenSet } from '@/shared/lib/page-tokens';
import { editKey, setEdit, type Change, type Edits } from '@/shared/lib/token-changes.pure';
import type { Theme } from '@/shared/lib/token-discovery.pure';
import { groupGlobalTokens, groupSlideTokens, type TokenGroup } from '@/shared/lib/token-groups.pure';
import { cn } from '@/shared/lib/utils';
import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import styles from './token-panel.module.css';
import { TokenRow, type RowAddon } from './token-row.client';

type Tab = 'global' | 'slide';

interface ListProps {
  scope: TokenSet['scope'];
  theme: Theme;
  edits: Edits;
  onEdit: (next: Edits) => void;
  rowAddon?: RowAddon;
}

function GroupSection({ group, scope, theme, edits, onEdit, rowAddon }: ListProps & { group: TokenGroup }) {
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
              scope={scope}
              token={token}
              theme={theme}
              value={edits[key] ?? token[theme]}
              changed={key in edits}
              rowAddon={rowAddon}
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

/** The second row: which theme's values an edit changes, as the site's sun or moon. */
function ThemeRow({ theme }: { theme: Theme }) {
  const ThemeIcon = theme === 'dark' ? Moon : Sun;
  return (
    <p
      className="text-muted-foreground flex items-center gap-1.5 text-caption"
      title="Edits change this theme's values"
      data-testid="token-theme-row"
    >
      <ThemeIcon aria-hidden className="size-4" />
      Editing {theme} values
    </p>
  );
}

function Scope({ slideId, children }: { slideId?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      {slideId && (
        <p
          className="text-muted-foreground truncate text-caption font-medium"
          title={slideId}
          data-testid="token-slide-title"
        >
          {slideId}
        </p>
      )}
      {children}
    </div>
  );
}

export interface PanelProps {
  theme: Theme;
  /** The page's tokens; `currentSlide` is `null` on a page that reports no Slide, where the Slide tab is off. */
  tokens: PageTokens;
  edits: Edits;
  changes: Change[];
  onEdits: (next: Edits) => void;
  top: number;
  /** Extra UI under each token row, supplied by the editor's root. */
  rowAddon?: RowAddon;
}

function ScopeContents({ tokens, ...list }: ListScope & { tokens: PageTokens }) {
  const slideId = tokens.currentSlide;
  return (
    <div className="-mx-3 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3" data-testid="token-scroll">
      <TabsContent value="global">
        <Scope>
          <TokenGroups set={tokens.globals} tab="global" {...list} />
        </Scope>
      </TabsContent>
      {slideId && (
        <TabsContent value="slide">
          <Scope slideId={slideId}>
            <TokenGroups set={tokens.slides[slideId]} tab="slide" {...list} />
          </Scope>
        </TabsContent>
      )}
    </div>
  );
}

/** The scope tabs and what each shows. The Slide tab exists only while the page reports a Slide. */
function ScopeTabs({
  tab,
  onTab,
  theme,
  tokens,
  edits,
  onEdits,
  rowAddon,
}: Omit<PanelProps, 'changes' | 'top'> & TabState) {
  const slideId = tokens.currentSlide;
  const list = { theme, edits, onEdit: onEdits, rowAddon };
  return (
    <Tabs value={tab} onValueChange={(next) => onTab(next as Tab)} className="min-h-0 flex-1 gap-3">
      <TabsList aria-label="Token scope" className="self-start">
        <TabsTrigger value="global">Global</TabsTrigger>
        {slideId && (
          <TabsTrigger value="slide" className={styles.slideTab}>
            Slide
          </TabsTrigger>
        )}
      </TabsList>
      <ThemeRow theme={theme} />
      <ScopeContents tokens={tokens} {...list} />
    </Tabs>
  );
}

type ListScope = Omit<ListProps, 'scope'>;

interface TabState {
  tab: Tab;
  onTab: (tab: Tab) => void;
}

/**
 * The popover body: scope tabs (Slide only while the page reports one), the theme row, the
 * grouped token list for the active theme, and the copy and reset actions. It
 * follows the site's light or dark theme with a palette of its own (see the CSS
 * module), so it keeps its look while the site's tokens are edited.
 */
export function TokenPanel({ theme, tokens, edits, changes, onEdits, top, rowAddon }: PanelProps) {
  const [tab, setTab] = useState<Tab>('global');
  const shown: Tab = tab === 'slide' && tokens.currentSlide ? 'slide' : 'global';
  return (
    <div
      role="dialog"
      aria-label="Design-system token editor"
      data-testid="design-system-token-panel"
      style={{ top, maxHeight: `calc(100svh - ${top}px - 1rem)` }}
      className={cn(
        styles.panel,
        'bg-card text-card-foreground border-border shadow-header fixed right-4 z-60 flex w-[min(28rem,calc(100vw-2rem))] flex-col gap-3 rounded-xl border p-3 text-caption max-sm:left-4',
      )}
    >
      <ScopeTabs
        tab={shown}
        onTab={setTab}
        theme={theme}
        tokens={tokens}
        edits={edits}
        onEdits={onEdits}
        rowAddon={rowAddon}
      />
      <Actions changes={changes} onReset={() => onEdits({})} />
    </div>
  );
}
