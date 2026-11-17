import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneCard } from '@/episodes/components/slide-shared/iceberg/zone-card';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import styles from './retire.module.css';
import { CrateArt, SheetPaper } from './room-art';

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
    <div className="relative border-b-2 border-current pb-1">
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
  readonly uses: number;
  readonly usesLabel: string;
}

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

export function BeforeIndex(props: {
  readonly heading: ByView;
  readonly count: ByView;
  readonly season: string;
  readonly lines: readonly BeforeLine[];
  readonly more: string;
}) {
  return (
    <ZoneCard className="focus-group__item relative flex flex-col gap-2 p-4 pt-5">
      <SheetPaper sheet="before" />
      <SheetHead heading={props.heading} count={props.count} note={props.season} />
      <ol className="relative flex flex-col">
        {props.lines.map((line) => (
          <BeforeLineItem key={line.folder} line={line} />
        ))}
      </ol>
      <p className="relative text-caption text-muted-foreground italic">{props.more}</p>
    </ZoneCard>
  );
}

export interface LogRow {
  readonly key: string;
  readonly date: string;
  readonly task: string;
  readonly skill: ByView;
}

export function TaskLog(props: {
  readonly heading: string;
  readonly season: string;
  readonly rows: readonly LogRow[];
  readonly more: string;
}) {
  return (
    <ZoneCard className="focus-group__item relative flex flex-col gap-2 p-4 pt-5">
      <SheetPaper sheet="log" />
      <p className="relative flex items-baseline justify-between gap-3 border-b-2 border-current pb-1">
        <span className="text-body font-semibold">{props.heading}</span>
        <span className="text-caption text-muted-foreground">{props.season}</span>
      </p>
      <ol className="relative flex flex-col gap-1.5">
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
      <p className="relative text-caption text-muted-foreground">{props.more}</p>
    </ZoneCard>
  );
}

export function ArchiveCrate({ lines }: { readonly lines: readonly ByView[] }) {
  return (
    <div className="focus-group__item">
      <CrateArt
        label={lines.map((words, index) => (
          <Swap
            key={words.chat}
            words={words}
            className={cn('text-caption text-card-foreground', index === 0 && 'font-semibold')}
          />
        ))}
      />
    </div>
  );
}

export interface AfterLine {
  readonly folder: string;
  readonly label: string;
  readonly needed?: boolean;
}

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
        'focus-group__item card-hover card-hover--raise relative flex flex-col gap-2 p-4 pt-5',
        styles.closeUp,
      )}
    >
      <SheetPaper sheet="after" />
      <SheetHead heading={props.heading} count={props.count} />
      <ol className="relative flex flex-col gap-0.5">
        {props.lines.map((line) => (
          <AfterLineItem key={line.folder} line={line} neededLabel={props.neededLabel} />
        ))}
      </ol>
      <p className="relative text-caption text-muted-foreground">{props.callback}</p>
    </ZoneCard>
  );
}
