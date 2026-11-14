import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

export interface RequestBubbleProps {
  readonly who: string;
  readonly text: ReactNode;
  readonly codingWho: string;
  readonly coding: ReactNode;
  readonly className?: string;
}

/** The bubble's tail, pointing down at the captain where the bubble sits in the room. */
function BubbleTail() {
  return (
    <svg aria-hidden viewBox="0 0 40 40" className="absolute top-full left-[14%] -mt-[3px] hidden w-[11%] @5xl:block">
      <path d="M 0 0 L 20 38 L 40 0 Z" className="fill-card" />
      <path d="M 0 1 L 20 38 L 40 1" strokeWidth={2.5} strokeLinejoin="round" className="fill-none stroke-human" />
    </svg>
  );
}

/**
 * Your request on the day of the dive, in the captain's bubble (border in `human`, the speaker's meaning), its tail
 * pointing down at her where the bubble sits in the room, its matching words underlined in primary; in the Coding
 * agent view it becomes the prompt line typed to the agent.
 */
export function RequestBubble({ who, text, codingWho, coding, className }: RequestBubbleProps) {
  return (
    <div data-request className={cn('relative flex', className)}>
      <InView
        view="chat"
        as="div"
        className="relative flex w-full flex-col justify-center rounded-2xl border-2 border-human bg-card px-5 py-3 shadow-md"
      >
        <span className="text-caption font-semibold text-human">{who}</span>
        <span className="mt-1 text-body font-semibold text-card-foreground">{text}</span>
        <BubbleTail />
      </InView>
      <InView
        view="coding"
        as="div"
        className="flex w-full flex-col justify-center rounded-xl bg-foreground px-5 py-3 shadow-md"
      >
        <span className="text-caption font-semibold text-background">{codingWho}</span>
        <span className="mt-2 font-mono text-body text-background">
          <span aria-hidden>&gt; </span>
          {coding}
        </span>
      </InView>
    </div>
  );
}
