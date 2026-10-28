import { CHAT_MARKS } from '@/shared/components/core-components/chat-icons/chat-icons';
import { OUTLINED_ICON } from '@/shared/components/core-components/icon-button/icon-button.client';
import { ButtonGroup } from '@/shared/components/ui/button-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { externalHref } from '@/shared/lib/external-link.pure';
import { fillTemplate } from '@/shared/lib/template.pure';
import { cn } from '@/shared/lib/utils';
import type { UiWords } from './human-in-the-loop.types';
import type { ChatButtonDef } from './workflow-schema.types';

/** The look of Copy prompt beside it: the outlined pill, 36px high, its mark alone on a phone, mark and name from `md`. */
const CHAT_BUTTON = cn(OUTLINED_ICON, 'gap-1.5 text-caption font-medium md:w-auto md:px-3');

interface ChatButtonsProps {
  readonly buttons: readonly ChatButtonDef[];
  /** The group's accessible name, each button's tooltip, and the hidden hint that each link opens a new tab. */
  readonly words: Pick<UiWords, 'openAIChats' | 'openAIChatTip' | 'newTab'>;
}

function ChatButton({ button, words }: { readonly button: ChatButtonDef; readonly words: ChatButtonsProps['words'] }) {
  const { label, url, icon } = button;
  const Mark = icon ? CHAT_MARKS[icon] : null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={externalHref(url)}
          target="_blank"
          rel="noopener noreferrer"
          data-chat={label}
          aria-label={`${label}, ${words.newTab}`}
          className={cn(CHAT_BUTTON, !Mark && 'w-auto px-3')}
        >
          {Mark && <Mark className="size-4" />}
          <span className={Mark ? 'hidden md:inline' : undefined}>{label}</span>
        </a>
      </TooltipTrigger>
      <TooltipContent>{fillTemplate(words.openAIChatTip, { chat: label })}</TooltipContent>
    </Tooltip>
  );
}

/**
 * The AI chats a prompt can be pasted into, as one shadcn button group — "ChatGPT | Gemini" — each an empty chat in a
 * new tab, shaped like Copy prompt so the row reads as one. The link never carries the prompt: a prefilled chat breaks
 * once a pasted result makes the prompt long. They never lead: Copy prompt is the step's action.
 */
export function ChatButtons({ buttons, words }: ChatButtonsProps) {
  return (
    <ButtonGroup data-chat-buttons="" aria-label={words.openAIChats}>
      {buttons.map((button) => (
        <ChatButton key={button.url} button={button} words={words} />
      ))}
    </ButtonGroup>
  );
}
