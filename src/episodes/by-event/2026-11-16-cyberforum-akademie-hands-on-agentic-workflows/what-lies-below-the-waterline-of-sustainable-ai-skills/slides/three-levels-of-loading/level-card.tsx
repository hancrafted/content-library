import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import { at } from './control-room-art';
import styles from './slide.module.css';

export type Level = 'index' | 'card' | 'extras';

/** A level's number in its badge, then its plain label. */
function LevelHeading({ n, label }: { readonly n: number; readonly label: string }) {
  return (
    <p className="flex items-center gap-3 text-body font-semibold">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-caption text-background">
        {n}
      </span>
      {label}
    </p>
  );
}

/** One loading level, numbered, its plain label first; the words beneath follow the page's view. */
export function LevelCard(props: {
  readonly level: Level;
  readonly n: number;
  readonly label: string;
  readonly chat: ReactNode;
  readonly coding: ReactNode;
  readonly target?: { 'data-target': string };
}) {
  return (
    <li
      {...props.target}
      data-level={props.level}
      data-motion="ring"
      className={cn(
        styles.level,
        'card-hover card-hover--raise flex flex-col gap-2 rounded-xl bg-card p-4 text-card-foreground shadow-md',
      )}
    >
      <LevelHeading n={props.n} label={props.label} />
      <InView view="chat" as="div" className="flex flex-col gap-1">
        {props.chat}
      </InView>
      <InView view="coding" as="div" className="flex flex-col gap-1">
        {props.coding}
      </InView>
    </li>
  );
}

/** A number badge over the drawing, tying a level card to its place in the room. */
export function Badge({ n, x, y }: { readonly n: number; readonly x: number; readonly y: number }) {
  return (
    <span
      aria-hidden
      style={at(x, y)}
      className="absolute flex size-7 -translate-1/2 items-center justify-center rounded-full bg-foreground text-caption font-semibold text-background shadow-md"
    >
      {n}
    </span>
  );
}
