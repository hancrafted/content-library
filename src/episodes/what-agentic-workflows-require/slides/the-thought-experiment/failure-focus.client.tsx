'use client';

import { cn } from '@/shared/lib/utils';
import { useState, type ReactNode } from 'react';
import { focusOf, litOf, release, type FocusState } from './focus.pure';

export interface FocusItem {
  readonly slug: string;
  readonly tilt: string;
  readonly label: string;
  readonly body: ReactNode;
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
