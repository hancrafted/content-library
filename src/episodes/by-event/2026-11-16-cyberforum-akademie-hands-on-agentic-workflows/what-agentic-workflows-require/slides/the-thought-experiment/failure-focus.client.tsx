'use client';

import { cn } from '@/shared/lib/utils';
import { useState, type FocusEvent, type ReactNode } from 'react';
import { focusOf, type FocusState } from './focus.pure';

export interface FocusItem {
  readonly slug: string;
  /** What the card shows at rest: every failure stays readable. */
  readonly body: ReactNode;
  /** The cause, added while the card is lit: detail, never content. */
  readonly cause: ReactNode;
}

interface FailureFocusProps {
  readonly label: string;
  readonly items: readonly FocusItem[];
}

interface CardProps {
  readonly item: FocusItem;
  readonly index: number;
  readonly focus: FocusState;
  readonly handlers: {
    readonly onPointerEnter: () => void;
    readonly onPointerLeave: () => void;
    readonly onFocus: (event: FocusEvent<HTMLElement>) => void;
    readonly onBlur: () => void;
  };
}

/** One failure card: its body at rest, and its cause, shown while it is lit. */
function FocusCard({ item, index, focus, handlers }: CardProps) {
  const on = focus === 'lit';
  const dimmed = focus === 'dimmed';
  return (
    <li
      data-failure-card={item.slug}
      data-lit={on || undefined}
      data-dimmed={dimmed || undefined}
      tabIndex={0}
      {...handlers}
      className={cn(
        'flex min-w-0 flex-col gap-3 rounded-sm bg-card p-3 shadow-md outline-offset-4 transition-[opacity,translate,box-shadow] duration-200 ease-out motion-reduce:transition-none',
        index % 2 === 0 ? 'rotate-1' : '-rotate-1',
        on && '-translate-y-1 shadow-lg',
        dimmed && 'opacity-40',
      )}
    >
      {item.body}
      <div
        data-cause
        className={cn(
          'min-h-[3.25rem] rounded-sm bg-muted px-2 py-1.5 text-caption text-muted-foreground transition-opacity duration-200 motion-reduce:transition-none print:opacity-100 [@media(hover:none)]:opacity-100',
          on ? 'opacity-100' : 'opacity-0',
        )}
      >
        {item.cause}
      </div>
    </li>
  );
}

/**
 * The four failures as a focus group: pointing at one, or tabbing onto it, lights it and dims the other three
 * (`focusOf`, as ai-capability dims its Levels). Keyboard focus counts; the focus a click leaves behind does not. The
 * cause is always in the DOM; it shows while its card is lit, and always where nothing can hover or the page prints.
 */
export function FailureFocus({ label, items }: FailureFocusProps) {
  const [lit, setLit] = useState<string | null>(null);
  return (
    <ul aria-label={label} className="grid grid-cols-1 gap-3 px-1 @2xl:grid-cols-2 @5xl:grid-cols-4">
      {items.map((item, index) => (
        <FocusCard
          key={item.slug}
          item={item}
          index={index}
          focus={focusOf(lit, item.slug)}
          handlers={{
            onPointerEnter: () => setLit(item.slug),
            onPointerLeave: () => setLit(null),
            onFocus: (event) => {
              if (event.currentTarget.matches(':focus-visible')) setLit(item.slug);
            },
            onBlur: () => setLit(null),
          }}
        />
      ))}
    </ul>
  );
}
