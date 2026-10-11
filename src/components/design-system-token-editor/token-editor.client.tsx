'use client';

import { Button } from '@/components/ui/button';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import { Palette } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Edits } from './token-changes.pure';
import { TokenPanel } from './token-panel.client';
import { changedTokens, useLiveEdits, usePageTokens } from './use-page-tokens';

function Launcher({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <Button
      size="icon"
      variant="outline"
      aria-expanded={open}
      aria-label="Design-system token editor"
      onClick={onToggle}
    >
      <Palette aria-hidden />
    </Button>
  );
}

/**
 * The dev-only design-system token editor: a popover that edits the global
 * tokens and the current Slide's own tokens in the active theme, live. Nothing
 * is saved; "Copy changed" exports the changes as a prompt for an agent.
 */
export default function TokenEditor() {
  const theme = useResolvedTheme();
  const [open, setOpen] = useState(false);
  const [edits, setEdits] = useState<Edits>({});
  const tokens = usePageTokens();
  useLiveEdits(tokens, edits, theme);
  const changes = useMemo(() => changedTokens(tokens, edits), [tokens, edits]);
  return (
    // Bottom-right, above the Context trigger: bottom-left is the Next.js dev badge.
    <div
      data-testid="design-system-token-editor"
      className="fixed right-4 bottom-20 z-50 flex flex-col items-end gap-2"
    >
      {open && (
        <TokenPanel
          theme={theme}
          globals={tokens.globals}
          slide={tokens.currentSlide ? tokens.slides[tokens.currentSlide] : undefined}
          edits={edits}
          changes={changes}
          onEdits={setEdits}
        />
      )}
      <Launcher open={open} onToggle={() => setOpen((o) => !o)} />
    </div>
  );
}
