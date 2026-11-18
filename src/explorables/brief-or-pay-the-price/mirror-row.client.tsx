'use client';

import { cn } from '@/shared/lib/utils';
import { memo, type MouseEvent, type PointerEvent } from 'react';
import type { Definition } from './brief-or-pay-the-price.types';
import type { RowRead, Side, Target } from './explorable-state.pure';
import { Card, type SceneLabels } from './mirror-card.client';
import styles from './mirror.module.css';

export interface MirrorHandlers {
  readonly onOpen: (target: Target) => void;
  readonly onLeave: (target: Target) => void;
  readonly onTurn: (row: number, side: Side) => void;
}

function controlHandlers(target: Target, { onOpen, onLeave }: MirrorHandlers) {
  return {
    onPointerEnter: (event: PointerEvent) => event.pointerType !== 'touch' && onOpen(target),
    onPointerLeave: (event: PointerEvent) => event.pointerType !== 'touch' && onLeave(target),
    onFocus: () => onOpen(target),
    onBlur: () => onLeave(target),
    onClick: (event: MouseEvent) => {
      event.stopPropagation();
      onOpen(target);
    },
  };
}

function Arrow({ toAi }: { readonly toAi: boolean }) {
  return (
    <svg
      viewBox="0 0 24 12"
      className={cn(styles.arrow, toAi ? styles.arrowRight : styles.arrowLeft, 'hidden h-3 w-6 shrink-0 @3xl:block')}
      aria-hidden="true"
    >
      <path
        d={toAi ? 'M1 6h20M17 2l4 4-4 4' : 'M23 6H3M7 2 3 6l4 4'}
        className={cn('fill-none', toAi ? 'stroke-ai' : 'stroke-muted-foreground')}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type RowView = Definition['rows'][number];

function accessibleName({ words }: RowView): string {
  const name = words.gloss === '' ? words.name : `${words.name} (${words.gloss})`;
  return `${name}: ${words.short}`;
}

function ChipFace({ row }: { readonly row: RowView }) {
  const { words } = row;
  return (
    <>
      <span data-trait-initial translate="no" className="text-heading leading-none font-semibold">
        {row.letter}
      </span>
      <span translate="no" className="text-caption whitespace-nowrap text-primary-foreground/80">
        {words.name}
      </span>
      {words.gloss === '' ? null : (
        <span data-trait-gloss className="text-caption leading-none whitespace-nowrap text-primary-foreground/70">
          {words.gloss}
        </span>
      )}
    </>
  );
}

const CHIP =
  'flex w-44 touch-manipulation flex-col items-center gap-1 rounded-full bg-primary px-4 py-2 text-primary-foreground shadow-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

interface RowProps {
  readonly row: RowView;
  readonly index: number;
  readonly read: RowRead;
  readonly handlers: MirrorHandlers;
  readonly labels: SceneLabels;
}

function ChipTrack({ row, index, read, handlers }: Omit<RowProps, 'labels'>) {
  return (
    <div className="flex items-center justify-center gap-1 @3xl:order-2 @3xl:w-60 @3xl:shrink-0">
      <Arrow toAi={false} />
      <button
        type="button"
        aria-expanded={read.shown}
        aria-label={accessibleName(row)}
        {...controlHandlers(index, handlers)}
        className={cn(styles.chip, CHIP)}
      >
        <ChipFace row={row} />
      </button>
      <Arrow toAi />
    </div>
  );
}

function SideCard({ row, index, read, handlers, labels, side }: RowProps & { readonly side: Side }) {
  return (
    <Card
      id={row.id}
      side={side}
      short={row.words.short}
      text={row.words[side]}
      shown={read.shown}
      pass={read.pass}
      turned={read.turned[side]}
      labels={labels}
      index={index}
      onTurn={handlers.onTurn}
      className={side === 'ai' ? '@3xl:order-3' : '@3xl:order-1'}
    />
  );
}

const sameRead = (a: RowRead, b: RowRead): boolean =>
  a.shown === b.shown &&
  a.pass === b.pass &&
  a.looping === b.looping &&
  a.blank === b.blank &&
  a.turned.freelancer === b.turned.freelancer &&
  a.turned.ai === b.turned.ai;

const sameRowByRead = (before: RowProps, after: RowProps): boolean =>
  before.row === after.row &&
  before.index === after.index &&
  before.handlers === after.handlers &&
  before.labels === after.labels &&
  sameRead(before.read, after.read);

// decision: FE-012 §4.2
export const Row = memo(function Row(props: RowProps) {
  const { shown, pass, looping, blank } = props.read;
  return (
    <li
      data-target={props.row.id}
      className={cn(
        'focus-group__item flex flex-col gap-3 @3xl:flex-row @3xl:items-stretch',
        shown && styles.isShown,
        pass > 0 && styles.isPlayed,
        looping && styles.isLooping,
        blank && styles.isBlank,
      )}
    >
      <ChipTrack {...props} />
      <SideCard {...props} side="freelancer" />
      <SideCard {...props} side="ai" />
    </li>
  );
}, sameRowByRead);

export function ClosingLine({
  lead,
  text,
  open,
  handlers,
}: {
  readonly lead: string;
  readonly text: string;
  readonly open: boolean;
  readonly handlers: MirrorHandlers;
}) {
  return (
    <p data-target="closing" className="flex items-center justify-center gap-1 pt-4 text-center text-body">
      <button
        type="button"
        aria-expanded={open}
        {...controlHandlers('closing', handlers)}
        className={cn(styles.footer, 'touch-manipulation rounded-full px-3 py-1 text-balance')}
      >
        <strong className="font-semibold">{lead}</strong> {text}
      </button>
    </p>
  );
}
