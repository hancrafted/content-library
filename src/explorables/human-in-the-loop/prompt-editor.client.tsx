'use client';

import { OUTLINED_ICON } from '@/shared/components/core-components/icon-button/icon-button.client';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/lib/utils';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import type { UiWords } from './human-in-the-loop.types';
import { withEdit } from './prompt-edits.pure';
import type { EditState } from './step-kit.types';

/*
 * The pencil beside Copy prompt and the editor it opens: a textarea of the step's prompt as markdown with its
 * `{{markers}}` raw, and Reset and Close over it. The pencil only shows or hides the editor; the edit itself is kept
 * (and copied) whether the editor is open or not.
 */

const ROWS = 14;

interface ToggleProps {
  readonly words: UiWords;
  readonly open: boolean;
  readonly onToggle: () => void;
}

/** Icon-only, joined to Copy prompt in one button group; pressed while the editor is open. */
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
  /** The text shown: the edit, else the YAML prompt. */
  readonly text: string;
  /** Whether an edit exists: Reset is disabled without one. */
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
          {words.reset}
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

/** Where a step's edit is stored and what its YAML prompt reads. */
export interface EditAt {
  readonly key: string;
  readonly yaml: string;
}

/** A step's edit: whether there is one, the text to show, and how it changes or goes. */
export function editOf({ values, onChange }: EditState, at: EditAt) {
  const edit = values[at.key];
  return {
    edit,
    text: edit ?? at.yaml,
    onText: (text: string) => onChange(withEdit(values, at, text)),
    onReset: () => onChange(withEdit(values, at, null)),
  };
}

/** Whether the editor is open: transient, so a reload closes it. */
export function useOpen() {
  const [on, set] = useState(false);
  return { on, toggle: () => set((now) => !now), close: () => set(false) };
}
