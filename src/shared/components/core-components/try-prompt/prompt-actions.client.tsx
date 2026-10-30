'use client';

import { useMotion } from '@/shared/hooks/use-motion';
import { cn } from '@/shared/lib/utils';
import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { OUTLINED_ICON } from '../icon-button/icon-button.client';
import styles from './prompt-actions.module.css';
import type { PromptKit } from './try-prompt.types';

/*
 * The copy button of a prompt row, written out next to its icon: "Copy prompt", which confirms a copy with a tick and
 * "Copied" for a moment. The row carries no chat link: the caller adds the chats to paste into, so a prompt never
 * travels in a URL. No tooltips: the words are on the button.
 */

/** A button with its name beside the icon: the icon alone on a phone, the icon and its name from `md` up. */
const WRITTEN_OUT = cn(OUTLINED_ICON, 'text-caption font-medium', 'md:w-auto md:gap-1.5 md:px-3');

/** The button the viewer should press next: filled in the action colour, so the eye lands on it. */
const LEAD = 'border-(--info) bg-(--info) text-(--info-foreground) hover:bg-(--info)/90 hover:text-(--info-foreground)';

/** How long the copy button says "Copied" before it reads "Copy prompt" again. */
const CONFIRM_MS = 1600;

/** Whether the last copy just succeeded: true for `CONFIRM_MS` after `confirm()`, then false again. */
function useConfirmed() {
  const [at, setAt] = useState(0);
  useEffect(() => {
    if (at === 0) return;
    const timer = setTimeout(() => setAt(0), CONFIRM_MS);
    return () => clearTimeout(timer);
  }, [at]);
  return [at !== 0, () => setAt((now) => now + 1)] as const;
}

interface CopyButtonProps {
  readonly label: string;
  readonly done: string;
  readonly onCopy: () => Promise<boolean>;
  /** Whether this is the next thing to press. */
  readonly lead?: boolean;
  /** A tooltip saying where the copied text goes. */
  readonly tip?: string;
}

/** "Copy prompt": a press copies, and on success the icon turns into a tick and the label into "Copied", then back. */
export function CopyButton({ label, done, onCopy, lead = false, tip }: CopyButtonProps) {
  const motion = useMotion();
  const [confirmed, confirm] = useConfirmed();
  const Icon = confirmed ? Check : Copy;
  return (
    <button
      type="button"
      {...motion}
      aria-label={label}
      title={tip}
      data-copied={confirmed}
      data-lead={lead || undefined}
      className={cn(WRITTEN_OUT, lead && LEAD)}
      onClick={() => void onCopy().then((ok) => ok && confirm())}
    >
      <Icon key={String(confirmed)} aria-hidden="true" className={cn('size-4', confirmed && styles.pop)} />
      <span className="hidden md:inline">{confirmed ? done : label}</span>
    </button>
  );
}

interface PromptActionsProps {
  readonly text: string;
  readonly copyLabel: string;
  readonly kit: PromptKit;
  /** Copy prompt is the next thing to press. */
  readonly lead?: boolean;
}

/** The button of a prompt: copy it. */
export function PromptActions({ text, copyLabel, kit, lead }: PromptActionsProps) {
  const { words } = kit;
  return <CopyButton label={copyLabel} done={words.copied ?? copyLabel} onCopy={() => kit.onCopy(text)} lead={lead} />;
}
