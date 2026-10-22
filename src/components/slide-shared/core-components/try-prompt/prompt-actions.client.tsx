'use client';

import { externalHref } from '@/lib/external-link.pure';
import { cn } from '@/lib/utils';
import { Copy } from 'lucide-react';
import type { ReactNode } from 'react';
import { ChatGptMark, ClaudeMark } from '../chat-icons/chat-icons';
import { IconButton, OUTLINED_ICON } from '../icon-button/icon-button.client';
import { Tip } from '../tip/tip.client';
import { openInLinks } from './chat-links.pure';
import type { PromptKit } from './try-prompt.types';

/* The icon buttons of a prompt row: the Short toggle, copy, and the two "open in" links. */

const SHORT =
  'inline-flex min-h-9 cursor-pointer items-center rounded-full border border-border px-3 text-caption font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring';

export function ShortToggle({ kit }: { kit: PromptKit }) {
  return (
    <Tip text={kit.words.shortTip} place="above" align="end">
      <button
        type="button"
        aria-pressed={kit.short}
        onClick={kit.onShort}
        className={cn(
          SHORT,
          kit.short ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-accent',
        )}
      >
        {kit.words.short}
      </button>
    </Tip>
  );
}

interface ChatLinkProps {
  readonly url: string;
  readonly label: string;
  readonly tip: string;
  readonly newTab: string;
  readonly onOpen?: () => void;
  readonly children: ReactNode;
}

function ChatLink({ url, label, tip, newTab, onOpen, children }: ChatLinkProps) {
  return (
    <Tip text={tip} place="above" align="end">
      <a
        className={OUTLINED_ICON}
        href={externalHref(url)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${label}, ${newTab}`}
        onClick={onOpen}
      >
        {children}
      </a>
    </Tip>
  );
}

/** The three icon buttons of a prompt: copy it, open it in ChatGPT, open it in Claude. */
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
      <ChatLink url={links.claude} label={words.openClaude} tip={tip(words.openClaude)} {...common}>
        <ClaudeMark className="size-4" />
      </ChatLink>
    </>
  );
}
