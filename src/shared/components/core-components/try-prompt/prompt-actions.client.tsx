'use client';

import { useMotion } from '@/shared/hooks/use-motion';
import { cn } from '@/shared/lib/utils';
import { Check, Copy } from 'lucide-react';
import { useEffect, useState, type ButtonHTMLAttributes } from 'react';
import { OUTLINED_ICON } from '../icon-button/icon-button.client';
import styles from './prompt-actions.module.css';
import type { PromptKit } from './try-prompt.types';

/*
 * The copy button of a prompt row, written out next to its icon: "Copy prompt", which confirms a copy with a tick and
 * "Copied" for a moment. The row carries no chat link: the caller adds the chats to paste into, so a prompt never
 * travels in a URL. No tooltips: the words are on the button.
 */

const WRITTEN_OUT = cn(OUTLINED_ICON, 'text-caption font-medium', 'md:w-auto md:gap-1.5 md:px-3');

/** The button the viewer should press next: filled in the action colour, so the eye lands on it. */
const LEAD = 'border-(--info) bg-(--info) text-(--info-foreground) hover:bg-(--info)/90 hover:text-(--info-foreground)';

const CONFIRM_MILLISECONDS = 1600;

function useConfirmed() {
  const [at, setAt] = useState(0);
  useEffect(() => {
    if (at === 0) return;
    const timer = setTimeout(() => setAt(0), CONFIRM_MILLISECONDS);
    return () => clearTimeout(timer);
  }, [at]);
  return [at !== 0, () => setAt((now) => now + 1)] as const;
}

interface CopyButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label' | 'type' | 'onClick' | 'title'
> {
  readonly label: string;
  readonly done: string;
  readonly onCopy: () => Promise<boolean>;
  readonly lead?: boolean;
  readonly tip?: string;
  readonly edited?: boolean;
}

function attrsOf({ confirmed, lead, edited }: Pick<CopyButtonProps, 'lead' | 'edited'> & { confirmed: boolean }) {
  return {
    'data-edited': edited || undefined,
    'data-copied': confirmed,
    'data-lead': lead || undefined,
  };
}

function EditedDot({ edited }: Pick<CopyButtonProps, 'edited'>) {
  if (!edited) return null;
  return <span aria-hidden="true" data-edited-dot="" className="size-1.5 rounded-full bg-current" />;
}

export function CopyButton({ label, done, onCopy, lead = false, tip, edited, ...rest }: CopyButtonProps) {
  const motion = useMotion();
  const [confirmed, confirm] = useConfirmed();
  const Icon = confirmed ? Check : Copy;
  return (
    <button
      type="button"
      {...motion}
      {...rest}
      aria-label={label}
      title={tip}
      {...attrsOf({ confirmed, lead, edited })}
      className={cn(WRITTEN_OUT, lead && LEAD)}
      onClick={() => void onCopy().then((ok) => ok && confirm())}
    >
      <Icon key={String(confirmed)} aria-hidden="true" className={cn('size-4', confirmed && styles.pop)} />
      <span className="hidden md:inline">{confirmed ? done : label}</span>
      <EditedDot edited={edited} />
    </button>
  );
}

interface PromptActionsProps {
  readonly text: string;
  readonly copyLabel: string;
  readonly kit: PromptKit;
  readonly lead?: boolean;
}

export function PromptActions({ text, copyLabel, kit, lead }: PromptActionsProps) {
  const { words } = kit;
  return <CopyButton label={copyLabel} done={words.copied ?? copyLabel} onCopy={() => kit.onCopy(text)} lead={lead} />;
}
