import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneCard } from '@/episodes/components/slide-shared/iceberg/zone-card';
import { cn } from '@/shared/lib/utils';
import type { CSSProperties, ReactNode } from 'react';
import styles from './retire.module.css';

/** Words that differ by view: the skill as the chat app names it, or its folder. */
export interface ByView {
  readonly chat: string;
  readonly coding: string;
}

function Swap({ words, className }: { readonly words: ByView; readonly className?: string }) {
  return (
    <>
      <InView view="chat" className={className}>
        {words.chat}
      </InView>
      <InView view="coding" className={cn('font-mono', className)}>
        <span translate="no">{words.coding}</span>
      </InView>
    </>
  );
}

function SheetHead({
  heading,
  count,
  note,
}: {
  readonly heading: ByView;
  readonly count: ByView;
  readonly note?: string;
}) {
  return (
    <div className="border-b-2 border-current pb-1">
      {note === undefined ? null : <p className="text-right text-caption text-muted-foreground">{note}</p>}
      <p className="flex items-baseline justify-between gap-3">
        <Swap words={heading} className="text-body font-semibold" />
        <Swap words={count} className="text-caption text-muted-foreground" />
      </p>
    </div>
  );
}

export interface BeforeLine {
  readonly folder: string;
  readonly label: string;
  /** How often a task used it this season; 0 is unused. */
  readonly uses: number;
  readonly usesLabel: string;
}

/** One line of the index before: its name and uses, struck through and greyed out when no task used it. */
function BeforeLineItem({ line: { folder, label, uses, usesLabel } }: { readonly line: BeforeLine }) {
  const unused = uses === 0;
  return (
    <li
      data-before-line={folder}
      data-unused={unused ? '' : undefined}
      className="flex items-baseline justify-between gap-3 border-b border-border py-0.5"
    >
      <Swap
        words={{ chat: label, coding: folder }}
        className={cn('text-caption', unused && cn('text-muted-foreground line-through', styles.greyOut))}
      />
      <span className={cn('shrink-0 text-caption', unused ? 'text-muted-foreground italic' : 'font-semibold')}>
        {usesLabel}
      </span>
    </li>
  );
}

/** The index before (Option 25b): Slide 9's lines at full ink, each kept name with its uses; the unused grey out. */
export function BeforeIndex(props: {
  readonly heading: ByView;
  readonly count: ByView;
  readonly season: string;
  readonly lines: readonly BeforeLine[];
  readonly more: string;
}) {
  return (
    <ZoneCard className="focus-group__item flex flex-col gap-2 rounded-lg p-4 shadow-md">
      <SheetHead heading={props.heading} count={props.count} note={props.season} />
      <ol className="flex flex-col">
        {props.lines.map((line) => (
          <BeforeLineItem key={line.folder} line={line} />
        ))}
      </ol>
      <p className="text-caption text-muted-foreground italic">{props.more}</p>
    </ZoneCard>
  );
}

export interface LogRow {
  readonly key: string;
  readonly date: string;
  readonly task: string;
  readonly skill: ByView;
}

/** The season's task log: what each task actually used, the record the index is read against. */
export function TaskLog(props: {
  readonly heading: string;
  readonly season: string;
  readonly rows: readonly LogRow[];
  readonly more: string;
}) {
  return (
    <ZoneCard className="focus-group__item flex flex-col gap-2 rounded-lg p-4 shadow-md">
      <p className="flex items-baseline justify-between gap-3 border-b-2 border-current pb-1">
        <span className="text-body font-semibold">{props.heading}</span>
        <span className="text-caption text-muted-foreground">{props.season}</span>
      </p>
      <ol className="flex flex-col gap-1.5">
        {props.rows.map(({ key, date, task, skill }) => (
          <li key={key} className="flex flex-col">
            <span className="text-caption text-muted-foreground">
              {date} · {task}
            </span>
            <span className="text-caption font-semibold">
              → <Swap words={skill} />
            </span>
          </li>
        ))}
      </ol>
      <p className="text-caption text-muted-foreground">{props.more}</p>
    </ZoneCard>
  );
}

/** The archive crate: the retired cards dropped in, its label naming the date and that a card can come back. */
export function ArchiveCrate({ cards, lines }: { readonly cards: number; readonly lines: readonly ByView[] }) {
  return (
    <div className="focus-group__item flex flex-col items-center">
      <div aria-hidden className="flex gap-1">
        {Array.from({ length: cards }, (_, n) => (
          <span
            key={n}
            className={cn('h-8 w-6 rounded-sm', styles.retired, styles.drop)}
            style={{ '--n': n } as CSSProperties}
          />
        ))}
      </div>
      <div className={cn('w-full rounded-lg px-4 pt-4 pb-3', styles.crate)}>
        <ZoneCard className="flex flex-col items-center rounded-md px-3 py-2 text-center">
          {lines.map((words, index) => (
            <Swap
              key={words.chat}
              words={words}
              className={cn('text-caption', index === 0 ? 'font-semibold' : 'text-muted-foreground')}
            />
          ))}
        </ZoneCard>
      </div>
    </div>
  );
}

export interface AfterLine {
  readonly folder: string;
  readonly label: string;
  readonly needed?: boolean;
}

/** One line of the short index; the one you need lit in `primary`. */
function AfterLineItem({ line, neededLabel }: { readonly line: AfterLine; readonly neededLabel: string }) {
  const { folder, label, needed } = line;
  return (
    <li
      data-after-line={folder}
      data-needed={needed ? '' : undefined}
      className={cn('flex flex-col rounded-md px-2 py-1', needed && styles.needed)}
    >
      <Swap words={{ chat: label, coding: folder }} className={needed ? 'text-body font-semibold' : 'text-caption'} />
      {needed ? <span className="text-caption">{neededLabel}</span> : null}
    </li>
  );
}

/** The short index left behind: seven lines, the one you need lit and back in view. */
export function AfterIndex(props: {
  readonly heading: ByView;
  readonly count: ByView;
  readonly lines: readonly AfterLine[];
  readonly neededLabel: string;
  readonly callback: ReactNode;
}) {
  return (
    <ZoneCard
      className={cn(
        'focus-group__item card-hover card-hover--raise flex flex-col gap-2 rounded-lg p-4 shadow-md',
        styles.closeUp,
      )}
    >
      <SheetHead heading={props.heading} count={props.count} />
      <ol className="flex flex-col gap-0.5">
        {props.lines.map((line) => (
          <AfterLineItem key={line.folder} line={line} neededLabel={props.neededLabel} />
        ))}
      </ol>
      <p className="text-caption text-muted-foreground">{props.callback}</p>
    </ZoneCard>
  );
}
