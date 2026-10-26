'use client';

import { useMotion } from '@/shared/hooks/use-motion';
import { externalHref } from '@/shared/lib/external-link.pure';
import { cn } from '@/shared/lib/utils';
import { Check, Copy } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { ChatGptMark } from '../chat-icons/chat-icons';
import { OUTLINED_ICON } from '../icon-button/icon-button.client';
import styles from './prompt-actions.module.css';
import type { PromptKit } from './try-prompt.types';

/*
 * The buttons of a prompt row, each written out next to its icon and read left to right: "Copy prompt", which confirms
 * a copy with a tick and "Copied" for a moment, then "Open in ChatGPT", an empty chat to paste it into. The link never
 * carries the prompt: a prefilled chat breaks once a pasted result makes the prompt long, so every prompt goes the
 * same way. No tooltips: the words are on the buttons.
 */

/** Where "Open in ChatGPT" goes: a new, empty chat. */
const CHATGPT = 'https://chatgpt.com/';

/** A button with its name beside the icon: the icon alone on a phone, the icon and its name from `md` up. */
const WRITTEN_OUT = cn(OUTLINED_ICON, 'text-caption font-medium', 'md:w-auto md:gap-1.5 md:px-3');

/** How long the copy button says "Copied" before it reads "Copy prompt" again. */
const CONFIRM_MS = 1600;

interface ChatLinkProps {
  readonly label: string;
  readonly newTab: string;
  readonly children: ReactNode;
}

function ChatLink({ label, newTab, children }: ChatLinkProps) {
  const motion = useMotion();
  return (
    <a
      {...motion}
      className={WRITTEN_OUT}
      href={externalHref(CHATGPT)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label}, ${newTab}`}
    >
      {children}
      <span className="hidden md:inline">{label}</span>
    </a>
  );
}

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
}

/** "Copy prompt": a press copies, and on success the icon turns into a tick and the label into "Copied", then back. */
function CopyButton({ label, done, onCopy }: CopyButtonProps) {
  const motion = useMotion();
  const [confirmed, confirm] = useConfirmed();
  const Icon = confirmed ? Check : Copy;
  return (
    <button
      type="button"
      {...motion}
      aria-label={label}
      data-copied={confirmed}
      className={WRITTEN_OUT}
      onClick={() => void onCopy().then((ok) => ok && confirm())}
    >
      <Icon key={String(confirmed)} aria-hidden="true" className={cn('size-4', confirmed && styles.pop)} />
      <span className="hidden md:inline">{confirmed ? done : label}</span>
    </button>
  );
}

/** The buttons of a prompt: copy it, open it in ChatGPT. */
export function PromptActions({ text, copyLabel, kit }: { text: string; copyLabel: string; kit: PromptKit }) {
  const { words } = kit;
  return (
    <>
      <CopyButton label={copyLabel} done={words.copied ?? copyLabel} onCopy={() => kit.onCopy(text)} />
      <ChatLink label={words.openChatgpt} newTab={words.newTab}>
        <ChatGptMark className="size-4" />
      </ChatLink>
    </>
  );
}
