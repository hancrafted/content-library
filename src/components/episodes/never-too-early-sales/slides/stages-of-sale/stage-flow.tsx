import type { TargetProps } from '@/lib/context-link.pure';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import type { CSSProperties } from 'react';
import styles from './stage-flow.module.css';

interface StageNote {
  readonly slug: string;
  readonly text: string;
  readonly detail?: string;
  readonly target?: TargetProps;
}

interface Stage {
  readonly slug: string;
  readonly title: string;
  /** The one thing to look at: rings the column and prints this tag under its header. */
  readonly tag?: string;
  readonly notes: readonly StageNote[];
  readonly target?: TargetProps;
}

interface StageFlowProps {
  /** Accessible name of the ordered list. */
  readonly label: string;
  readonly stages: readonly Stage[];
  /** The trailing dashed arrow to a cash note that has not arrived yet. */
  readonly delivery: { readonly label: string; readonly cash: string; readonly target?: TargetProps };
}

/** The entrance step as a plain number: it carries no colour or size (FE-011). */
function step(index: number): CSSProperties {
  return { '--step': index } as CSSProperties;
}

function Note({ note }: { note: StageNote }) {
  return (
    <li
      {...note.target}
      className="flex flex-col rounded-md border border-border bg-card p-3 text-caption text-foreground shadow-sm"
    >
      <span>{note.text}</span>
      {note.detail && <span className="text-caption text-muted-foreground">{note.detail}</span>}
    </li>
  );
}

function StageColumn({ stage, index }: { stage: Stage; index: number }) {
  return (
    <li
      {...stage.target}
      style={step(index)}
      className={cn(styles.stage, 'flex flex-col gap-3 rounded-lg bg-muted p-4', stage.tag && 'ring-2 ring-primary')}
    >
      <div className="flex flex-col">
        <span className="text-body font-semibold text-foreground">{stage.title}</span>
        {stage.tag && <span className="text-caption font-medium text-primary">{stage.tag}</span>}
      </div>
      <ul className="m-0 flex list-none flex-wrap gap-3 p-0 *:min-w-28 *:flex-1">
        {stage.notes.map((note) => (
          <Note key={note.slug} note={note} />
        ))}
      </ul>
    </li>
  );
}

/** Between two stages: a solid line and chevron, turned down while the stages stack. */
function Arrow({ index }: { index: number }) {
  return (
    <li
      aria-hidden="true"
      style={step(index)}
      className="flex rotate-90 items-center justify-center self-center p-1 @2xl:rotate-0"
    >
      <span className={cn(styles.arrow, 'flex items-center')}>
        <span className="h-0.5 w-10 bg-foreground" />
        <ChevronRight className="-ml-2 size-5 text-foreground" />
      </span>
    </li>
  );
}

function Delivery({ delivery, index }: { delivery: StageFlowProps['delivery']; index: number }) {
  return (
    <li
      {...delivery.target}
      style={step(index)}
      className={cn(styles.delivery, 'flex flex-col items-center gap-2 self-center @2xl:col-span-2 @2xl:flex-row')}
    >
      <span aria-hidden="true" className="flex rotate-90 items-center p-1 @2xl:rotate-0">
        <span className="w-10 border-t-2 border-dashed border-muted-foreground" />
        <ChevronRight className="-ml-2 size-5 text-muted-foreground" />
      </span>
      <span className="flex max-w-28 flex-col items-center gap-1 text-center">
        <span className="rounded-md border-2 border-dashed border-(--info) bg-transparent px-4 py-3 text-caption font-medium text-(--info)">
          {delivery.cash}
        </span>
        <span className="text-caption text-muted-foreground">{delivery.label}</span>
      </span>
    </li>
  );
}

/**
 * The stages of a sale as columns of a board, joined by arrows, with a
 * trailing delivery arrow to cash not yet on the account. Slide-local server
 * part, plain props; the base styles are the finished flow, and the entrance
 * plays only on the active Slide and never under reduced motion (FE-009 §6).
 * The row is keyed on the flow's own width (`@2xl`), not the viewport: beside
 * the table of contents a `md` page leaves too little room for seven tracks.
 */
export function StageFlow({ label, stages, delivery }: StageFlowProps) {
  return (
    <div className="@container">
      <ol
        aria-label={label}
        className="m-0 grid list-none grid-cols-1 gap-4 p-0 @2xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.6fr)_auto_minmax(0,1fr)_auto_auto] @2xl:items-start @2xl:gap-x-3"
      >
        {stages.map((stage, index) => [
          index > 0 && <Arrow key={`arrow-${stage.slug}`} index={index - 1} />,
          <StageColumn key={stage.slug} stage={stage} index={index} />,
        ])}
        <Delivery delivery={delivery} index={stages.length} />
      </ol>
    </div>
  );
}
