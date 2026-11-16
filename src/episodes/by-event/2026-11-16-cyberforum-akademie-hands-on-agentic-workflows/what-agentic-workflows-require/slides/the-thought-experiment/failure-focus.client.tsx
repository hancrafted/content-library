'use client';

import { cn } from '@/shared/lib/utils';
import { useState, type ReactNode } from 'react';
import { focusOf, litOf, release, type FocusState } from './focus.pure';

export interface FocusItem {
  readonly slug: string;
  /** The card's hand-placed tilt class, from the shared `tiltOf`. */
  readonly tilt: string;
  /** The card's name, for assistive technology: the focusable group is named by it. */
  readonly label: string;
  /** What the card shows at rest: every failure stays readable. */
  readonly body: ReactNode;
  /** The cause, shown at rest on every card. */
  readonly cause: ReactNode;
}

interface FailureFocusProps {
  readonly label: string;
  readonly items: readonly FocusItem[];
}

const CARD =
  'flex min-w-0 flex-1 flex-col gap-3 rounded-sm bg-card p-3 shadow-md outline-offset-4 transition-[opacity,translate,box-shadow] duration-200 ease-out focus-visible:outline-2 focus-visible:outline-ring motion-reduce:transition-none';

interface CardProps {
  readonly item: FocusItem;
  readonly focus: FocusState;
  readonly onHover: (slug: string | null) => void;
  readonly onFocusVisible: (slug: string | null) => void;
}

/** One failure card: a named, focusable group that shows its body and cause at rest and lights or dims as the group says. */
function FocusCard({ item, focus, onHover, onFocusVisible }: CardProps) {
  const { slug } = item;
  return (
    <li className="flex min-w-0 flex-col">
      <div
        role="group"
        aria-label={item.label}
        tabIndex={0}
        data-failure-card={slug}
        data-lit={focus === 'lit' || undefined}
        data-dimmed={focus === 'dimmed' || undefined}
        onPointerEnter={() => onHover(slug)}
        onPointerLeave={() => onHover(null)}
        onFocus={(event) => event.currentTarget.matches(':focus-visible') && onFocusVisible(slug)}
        onBlur={() => onFocusVisible(null)}
        className={cn(
          CARD,
          item.tilt,
          focus === 'lit' && '-translate-y-1 shadow-lg',
          focus === 'dimmed' && 'opacity-40',
        )}
      >
        {item.body}
        <div data-cause className="rounded-sm bg-muted px-2 py-1.5 text-caption text-muted-foreground">
          {item.cause}
        </div>
      </div>
    </li>
  );
}

/**
 * The four failures as a focus group: pointing at one, or tabbing onto it, lights it and dims the other three
 * (`focusOf`, as ai-capability dims its Levels). Everything, the cause included, is readable at rest; lighting adds
 * emphasis, never content. Pointer and keyboard focus are kept apart, so a pointer leaving one card never puts out the
 * light of the card that holds focus. The focus a click leaves behind does not count, only `:focus-visible` does.
 */
export function FailureFocus({ label, items }: FailureFocusProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const lit = litOf(hovered, focused);
  return (
    <ul aria-label={label} className="grid grid-cols-1 gap-3 px-1 @2xl:grid-cols-2 @5xl:grid-cols-4">
      {items.map((item) => (
        <FocusCard
          key={item.slug}
          item={item}
          focus={focusOf(lit, item.slug)}
          onHover={(slug) => setHovered((current) => (slug === null ? release(current, item.slug) : slug))}
          onFocusVisible={(slug) => setFocused((current) => (slug === null ? release(current, item.slug) : slug))}
        />
      ))}
    </ul>
  );
}
