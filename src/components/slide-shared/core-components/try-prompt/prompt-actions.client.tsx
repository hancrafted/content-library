'use client';

import { useMotion } from '@/hooks/use-motion';
import { externalHref } from '@/lib/external-link.pure';
import { cn } from '@/lib/utils';
import { Copy } from 'lucide-react';
import type { ReactNode } from 'react';
import { ChatGptMark } from '../chat-icons/chat-icons';
import { IconButton, OUTLINED_ICON } from '../icon-button/icon-button.client';
import { Tip } from '../tip/tip.client';
import { openInLinks } from './chat-links.pure';
import type { PromptKit } from './try-prompt.types';

/* The icon buttons of a prompt row: copy, and the "open in ChatGPT" link. */

/** The chat link: the icon alone on a phone, the icon and its name from `md` up. */
const WRITTEN_OUT = cn(OUTLINED_ICON, 'text-caption font-medium', 'md:w-auto md:gap-1.5 md:px-3');

interface ChatLinkProps {
  readonly url: string;
  readonly label: string;
  readonly tip: string;
  readonly newTab: string;
  readonly onOpen?: () => void;
  readonly children: ReactNode;
}

function ChatLink({ url, label, tip, newTab, onOpen, children }: ChatLinkProps) {
  const motion = useMotion();
  return (
    <Tip text={tip} place="above" align="end">
      <a
        {...motion}
        className={WRITTEN_OUT}
        href={externalHref(url)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${label}, ${newTab}`}
        onClick={onOpen}
      >
        {children}
        <span className="hidden md:inline">{label}</span>
      </a>
    </Tip>
  );
}

/** The icon buttons of a prompt: copy it, open it in ChatGPT. */
export function PromptActions({ text, copyLabel, kit }: { text: string; copyLabel: string; kit: PromptKit }) {
  const links = openInLinks(text);
  const { words } = kit;
  const tip = (label: string) => (links.tooLong && words.tooLong ? `${label}. ${words.tooLong}` : label);
  // A prompt too long for a link is copied as the empty chat opens, so it can be pasted there.
  const onOpen = links.tooLong ? () => kit.onCopy(text) : undefined;
  const common = { newTab: words.newTab, onOpen };
  return (
    <>
      <IconButton label={copyLabel} place="above" align="end" onClick={() => kit.onCopy(text)}>
        <Copy aria-hidden="true" className="size-4" />
      </IconButton>
      <ChatLink url={links.chatgpt} label={words.openChatgpt} tip={tip(words.openChatgpt)} {...common}>
        <ChatGptMark className="size-4" />
      </ChatLink>
    </>
  );
}
