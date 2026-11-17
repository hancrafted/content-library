import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import { at, INDEX, wide } from './control-room-art';
import styles from './slide.module.css';

/** The three skills of the index, by folder name: code, never translated. */
export const SLUGS = ['collect-sediment-sample', 'measure-water-column', 'run-camera-survey'] as const;

export function WayLabel({ x, y, children }: { readonly x: number; readonly y: number; readonly children: ReactNode }) {
  return (
    <p
      style={at(x, y)}
      className="absolute rounded-full bg-foreground px-3 py-1 text-caption font-semibold whitespace-nowrap text-background"
    >
      {children}
    </p>
  );
}

export function SyntaxRow({ app, syntax }: { readonly app: string; readonly syntax: string }) {
  return (
    <li className="flex flex-wrap justify-between gap-x-3">
      <span>{app}</span>
      <span className="font-mono font-semibold">{syntax}</span>
    </li>
  );
}

interface IndexEntry {
  readonly slug: string;
  readonly name: string;
  readonly useWhen: string;
}

function IndexLine({ entry, hit }: { readonly entry: IndexEntry; readonly hit: boolean }) {
  return (
    <li
      data-index-entry={entry.slug}
      data-motion={hit ? 'highlight' : undefined}
      className={cn('rounded-md px-2 py-1', hit && styles.hit)}
    >
      <InView view="chat" className="block font-semibold">
        {entry.name}
      </InView>
      <InView view="coding" className="block font-mono font-semibold break-all">
        {entry.slug}/SKILL.md
      </InView>
      <span className="block opacity-80">{entry.useWhen}</span>
    </li>
  );
}

export function IndexBoard(props: {
  readonly title: string;
  readonly subtitle: string;
  readonly coding: string;
  readonly entries: readonly IndexEntry[];
}) {
  return (
    <div
      data-index-board
      style={{ ...at(INDEX.x, INDEX.y), width: wide(INDEX.width) }}
      className="absolute flex flex-col gap-2 p-3 text-caption text-foreground"
    >
      <p>
        <InView view="chat">
          <span className="font-semibold">{props.title}</span> · {props.subtitle}
        </InView>
        <InView view="coding" className="font-mono">
          {props.coding}
        </InView>
      </p>
      <ol className="flex flex-col gap-1">
        {props.entries.map((entry, index) => (
          <IndexLine key={entry.slug} entry={entry} hit={index === 0} />
        ))}
      </ol>
    </div>
  );
}
