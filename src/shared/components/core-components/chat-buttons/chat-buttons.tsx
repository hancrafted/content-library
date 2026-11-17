import { CHAT_MARKS } from '@/shared/components/core-components/chat-icons/chat-icons';
import { OUTLINED_ICON } from '@/shared/components/core-components/icon-button/icon-button.client';
import { externalHref } from '@/shared/lib/external-link.pure';
import { fillTemplate } from '@/shared/lib/template.pure';
import { cn } from '@/shared/lib/utils';
import type { ChatMarkName } from '../chat-icons/chat-marks.pure';

const CHAT_BUTTON = cn(OUTLINED_ICON, 'gap-1.5 text-caption font-medium md:w-auto md:px-3');

export interface ChatButtonDef {
  readonly label: string;
  /** An `https://` link to a new, empty chat; it never carries the prompt. */
  readonly url: string;
  readonly icon?: ChatMarkName | null;
}

export interface ChatButtonsWords {
  readonly openAIChats: string;
  readonly openAIChatTip: string;
  readonly newTab: string;
}

interface ChatButtonsProps {
  readonly buttons: readonly ChatButtonDef[];
  readonly words: ChatButtonsWords;
}

export const DEFAULT_CHAT_BUTTONS: readonly ChatButtonDef[] = [
  { label: 'ChatGPT', url: 'https://chatgpt.com/', icon: 'chatgpt' },
  { label: 'Gemini', url: 'https://gemini.google.com/app', icon: 'gemini' },
];

function ChatButton({ button, words }: { readonly button: ChatButtonDef; readonly words: ChatButtonsWords }) {
  const { label, url, icon } = button;
  const Mark = icon ? CHAT_MARKS[icon] : null;
  return (
    <a
      href={externalHref(url)}
      target="_blank"
      rel="noopener noreferrer"
      data-chat={label}
      title={fillTemplate(words.openAIChatTip, { chat: label })}
      aria-label={`${label}, ${words.newTab}`}
      className={cn(CHAT_BUTTON, !Mark && 'w-auto px-3')}
    >
      {Mark && <Mark className="size-4" />}
      <span className={Mark ? 'hidden md:inline' : undefined}>{label}</span>
    </a>
  );
}

export const BUTTON_GROUP =
  'flex w-fit items-stretch [&>*]:focus-visible:relative [&>*]:focus-visible:z-10 [&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none';

/**
 * The AI chats a prompt can be pasted into, as one shadcn button group — "ChatGPT | Gemini" — each an empty chat in a
 * new tab, shaped like Copy prompt so the row reads as one. The link never carries the prompt: a prefilled chat breaks
 * once a pasted result makes the prompt long. They never lead: Copy prompt is the step's action.
 */
export function ChatButtons({ buttons, words }: ChatButtonsProps) {
  return (
    <div role="group" className={BUTTON_GROUP} data-chat-buttons="" aria-label={words.openAIChats}>
      {buttons.map((button) => (
        <ChatButton key={button.url} button={button} words={words} />
      ))}
    </div>
  );
}
