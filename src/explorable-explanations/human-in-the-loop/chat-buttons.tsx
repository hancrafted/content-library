import { Button } from '@/shared/components/ui/button';
import { ButtonGroup } from '@/shared/components/ui/button-group';
import { NAMED_ICONS } from '@/shared/components/ui/named-icons';
import { externalHref } from '@/shared/lib/external-link.pure';
import type { UiWords } from './human-in-the-loop.types';
import type { ChatButtonDef } from './workflow-schema.types';

interface ChatButtonsProps {
  readonly buttons: readonly ChatButtonDef[];
  /** The group's accessible name, and the hidden hint that each link opens a new tab. */
  readonly words: Pick<UiWords, 'openAIChats' | 'newTab'>;
}

/**
 * The AI chats a prompt can be pasted into, as one shadcn button group — "ChatGPT | Gemini" — each an empty chat in a
 * new tab. The link never carries the prompt: a prefilled chat breaks once a pasted result makes the prompt long. They
 * never lead: Copy prompt is the step's action.
 */
export function ChatButtons({ buttons, words }: ChatButtonsProps) {
  return (
    <ButtonGroup data-chat-buttons="" aria-label={words.openAIChats}>
      {buttons.map(({ label: name, url, icon }) => {
        const Icon = icon ? NAMED_ICONS[icon] : null;
        return (
          <Button key={url} asChild variant="outline" size="sm">
            <a href={externalHref(url)} target="_blank" rel="noopener noreferrer" data-chat={name}>
              {Icon && <Icon aria-hidden="true" />}
              {name}
              <span className="sr-only"> ({words.newTab})</span>
            </a>
          </Button>
        );
      })}
    </ButtonGroup>
  );
}
