'use client';

import { OUTLINED_ICON } from '@/shared/components/core-components/icon-button/icon-button.client';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/lib/utils';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { BlockedCopy } from './blocked-copy.client';
import type { UiWords } from './human-in-the-loop.types';

const ROWS = 14;

interface ToggleProps {
  readonly words: UiWords;
  readonly open: boolean;
  readonly onToggle: () => void;
}

export function EditToggle({ words, open, onToggle }: ToggleProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={words.editPrompt}
          aria-pressed={open}
          data-control="edit-prompt"
          onClick={onToggle}
          className={cn(OUTLINED_ICON, open && 'bg-accent text-accent-foreground')}
        >
          <Pencil aria-hidden="true" className="size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{words.editPrompt}</TooltipContent>
    </Tooltip>
  );
}

interface EditorProps {
  readonly words: UiWords;
  readonly text: string;
  readonly edited: boolean;
  readonly onText: (text: string) => void;
  readonly onReset: () => void;
  readonly onClose: () => void;
}

export function PromptEditor({ words, text, edited, onText, onReset, onClose }: EditorProps) {
  return (
    <div data-prompt-editor="" className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-center justify-end gap-1">
        <Button type="button" variant="ghost" size="sm" data-control="edit-reset" disabled={!edited} onClick={onReset}>
          {words.editReset}
        </Button>
        <Button type="button" variant="ghost" size="sm" data-control="edit-close" onClick={onClose}>
          {words.close}
        </Button>
      </div>
      <Textarea
        aria-label={words.editPrompt}
        rows={ROWS}
        spellCheck={false}
        value={text}
        onChange={(event) => onText(event.target.value)}
        className="font-mono text-caption"
      />
    </div>
  );
}

export function useOpen() {
  const [on, set] = useState(false);
  return { on, toggle: () => set((now) => !now), close: () => set(false) };
}

interface CopyPromptProps {
  readonly words: UiWords;
  readonly edited: boolean;
  readonly lead: boolean;
  readonly blocked?: boolean;
  readonly onCopy: () => Promise<boolean>;
}

export function CopyPrompt({ words, edited, lead, blocked = false, onCopy }: CopyPromptProps) {
  const button = (
    <BlockedCopy words={words} label={words.copyPrompt} blocked={blocked} lead={lead} edited={edited} onCopy={onCopy} />
  );
  if (!edited || blocked) return button;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>{words.editedTip}</TooltipContent>
    </Tooltip>
  );
}
