import { Button } from '@/shared/components/ui/button';
import { ButtonGroup } from '@/shared/components/ui/button-group';
import { NAMED_ICONS } from '@/shared/components/ui/named-icons';
import { externalHref } from '@/shared/lib/external-link.pure';
import type { ChatButtonDef } from './workflow-schema.types';

interface ChatButtonsProps {
  readonly buttons: readonly ChatButtonDef[];
  /** The hidden hint that each link opens a new tab. */
  readonly newTab: string;
}

/**
 * The AI chats a prompt can be pasted into, as one shadcn button group — "ChatGPT | Gemini" — each an empty chat in a
 * new tab. The link never carries the prompt: a prefilled chat breaks once a pasted result makes the prompt long. They
 * never lead: Copy prompt is the step's action.
 */
export function ChatButtons({ buttons, newTab }: ChatButtonsProps) {
  return (
    <ButtonGroup data-chat-buttons="">
      {buttons.map(({ label, url, icon }) => {
        const Icon = icon ? NAMED_ICONS[icon] : null;
        return (
          <Button key={url} asChild variant="outline" size="sm">
            <a href={externalHref(url)} target="_blank" rel="noopener noreferrer" data-chat={label}>
              {Icon && <Icon aria-hidden="true" />}
              {label}
              <span className="sr-only"> ({newTab})</span>
            </a>
          </Button>
        );
      })}
    </ButtonGroup>
  );
}
