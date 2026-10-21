'use client';

import { externalHref } from '@/lib/external-link.pure';
import type { UiWords } from './human-in-the-loop.types';
import type { ModalAction } from './workflow-view.pure';

const ACTION_LABEL: Record<ModalAction['id'], keyof UiWords> = {
  'copy-prompt': 'copyPrompt',
  'copy-command': 'copyCommand',
  'copy-example': 'copyExample',
  'copy-check': 'copyCheck',
  'copy-page': 'copyPage',
  'open-chatgpt': 'openChatgpt',
  'open-claude': 'openClaude',
};

export const BUTTON =
  'inline-flex min-h-9 items-center rounded-md border border-border bg-background px-3 text-caption font-medium hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none';

interface ModalActionsProps {
  readonly label: string;
  readonly actions: readonly ModalAction[];
  readonly words: UiWords;
  readonly onCopy: (text: string) => void;
  /** What the polite live region says; empty until a copy succeeds. */
  readonly announced: string;
}

function Action({ action, words, onCopy }: Pick<ModalActionsProps, 'words' | 'onCopy'> & { action: ModalAction }) {
  const text = words[ACTION_LABEL[action.id]];
  if (!('href' in action))
    return (
      <button type="button" className={BUTTON} onClick={() => onCopy(action.text)}>
        {text}
      </button>
    );
  return (
    <a
      className={BUTTON}
      href={externalHref(action.href)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${text}, ${words.newTab}`}
    >
      {text}
    </a>
  );
}

/** The header's quick actions: copies are buttons, the chat tools are links that open a prefilled new chat. */
export function ModalActions({ label, actions, words, onCopy, announced }: ModalActionsProps) {
  return (
    <>
      <div role="group" aria-label={label} className="mt-3 flex flex-wrap gap-2">
        {actions.map((action) => (
          <Action key={action.id} action={action} words={words} onCopy={onCopy} />
        ))}
      </div>
      <p role="status" aria-live="polite" className="mt-1 h-5 text-caption text-muted-foreground">
        {announced}
      </p>
    </>
  );
}
