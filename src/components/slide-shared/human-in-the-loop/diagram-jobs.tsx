import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { Check, FlowStub, ParkedStub, Sparkle } from '../glyphs/glyphs';
import { chatNames, splitParked } from './diagram-model.pure';
import type { JobSlot, PopoverCopy } from './human-in-the-loop.types';
import { NodePopover, type NodeCopy } from './node-popover.client';
import type { GateCard, Job } from './workflow.types';

/*
 * The job cards of the diagram, one per role, in the look the venue pipeline had. Static: a card opens a popover only
 * where the Slide gives it one.
 */

/** The `ai` edge on a job the AI does: a fresh chat. */
const AI_EDGE = 'border border-ai/50 bg-card shadow-md shadow-ai/15';

const NODE_BUTTON =
  'cursor-pointer outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring';

/** A job node: a button opening its popover where there is one, else a plain box of the same look. */
function Node({ copy, className, children }: { copy?: NodeCopy; className: string; children: ReactNode }) {
  if (!copy) return <span className={className}>{children}</span>;
  return (
    <NodePopover copy={copy} className={cn(NODE_BUTTON, className)}>
      {children}
    </NodePopover>
  );
}

/** A popover's copy with the name of the stage it explains as its title. */
export const popoverOf = (copy: PopoverCopy | undefined, stageName: string): NodeCopy | undefined =>
  copy && { title: stageName, ...copy };

export interface JobViewProps {
  readonly job: Job;
  readonly slot: JobSlot;
  /** The name of the stage the job sits in: the title of its popover. */
  readonly stageName: string;
  /** The word for this job's stage gate; absent when the stage has none. */
  readonly gateLabel?: string;
  readonly words: { readonly checked: string };
  /** The sign-off card of the job's stage, drawn on its focal job. */
  readonly card?: GateCard;
}

const PIECE = 'flex h-full min-w-0 flex-1 items-center rounded-full px-3 text-left text-caption';

/** The task's pieces: the one taken forward in the middle, the parked ones grey, each ending in a stub. */
export function PieceJobs({ job, slot, stageName }: JobViewProps) {
  const { before, after } = splitParked(job.parked ?? []);
  const piece = (label: string, parked: boolean) => {
    const tone = parked
      ? 'bg-muted/50 text-muted-foreground'
      : 'border border-foreground bg-card font-semibold text-foreground';
    return (
      <li key={`${parked}-${label}`} className="flex h-9 items-center gap-1.5">
        <Node copy={popoverOf(slot.popover, stageName)} className={cn(PIECE, tone)}>
          {label}
        </Node>
        {parked ? <ParkedStub /> : <FlowStub />}
      </li>
    );
  };
  return [...before.map((l) => piece(l, true)), piece(job.title, false), ...after.map((l) => piece(l, true))];
}

/** A job the AI does, as a card: the sparkle and its title, then its detail and, where it is gated, the gate. */
export function AiJob({ job, slot, gateLabel }: JobViewProps) {
  const detail = slot.detail ?? job.detail;
  return (
    <>
      <li className={cn('flex flex-col gap-1 rounded-2xl p-3', AI_EDGE)}>
        <span className="flex items-center gap-1.5 text-caption font-semibold">
          <Sparkle className="size-3.5" />
          {job.title}
        </span>
        {detail && <span className="text-caption text-muted-foreground">{detail}</span>}
        {gateLabel && (
          <span className="mt-1 inline-flex items-center gap-1 text-caption font-medium">
            {gateLabel}
            {slot.marker}
          </span>
        )}
      </li>
      {slot.after && <li className="flex justify-center">{slot.after}</li>}
    </>
  );
}

function CardLines({ lines }: { readonly lines: readonly string[] }) {
  if (lines.length === 0) return null;
  return (
    <ul className="mt-2 flex flex-col gap-1 border-t border-border pt-2 text-caption text-muted-foreground">
      {lines.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  );
}

/** The focal job as the stage's card, the one focal point: its gate, its lines, its status. */
export function FocalJob({ job, slot, gateLabel, card }: JobViewProps) {
  const { label, lines, status } = card ?? { label: job.title, lines: [], status: '' };
  return (
    <li className="-rotate-1 rounded-xl border border-border bg-background p-2.5 shadow-md">
      {gateLabel && <p className="text-caption font-medium text-muted-foreground uppercase">{gateLabel}</p>}
      <p className="text-caption font-semibold">{label}</p>
      <CardLines lines={lines} />
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <p className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-caption font-semibold text-primary-foreground">
          <Check className="size-3.5" />
          {status}
        </p>
        {slot.marker}
      </div>
    </li>
  );
}

/** The pills of a fan-out stand in a column of about 85px at 1280px: no icon beside the name, so "Chat 1" fits whole. */
const CHAT_PILL = 'flex h-12 w-full items-center justify-between gap-1 rounded-full px-2 text-caption font-semibold';

/** The parallel chats of a fanned-out job, each ticked where the job is checked against its criteria. */
export function ChatJobs({ job, slot, stageName, words }: JobViewProps) {
  return chatNames(job).map((name) => (
    <li key={name}>
      <Node copy={popoverOf(slot.popover, stageName)} className={cn(CHAT_PILL, AI_EDGE)}>
        <span className="min-w-0 truncate">{name}</span>
        {job.reviewed && (
          <span className="flex items-center text-muted-foreground">
            <Check className="size-4" />
            <span className="sr-only">{words.checked}</span>
          </span>
        )}
      </Node>
    </li>
  ));
}

/** What comes out: the document handed on. */
export function DeliverableJob({ job, slot }: JobViewProps) {
  const detail = slot.detail ?? job.detail;
  return (
    <li className="relative rounded-xl border border-foreground bg-background p-3">
      <svg viewBox="0 0 80 40" className="h-8 w-full" aria-hidden="true">
        <path d="M2 6h60 M2 18h76 M2 30h48" className="fill-none stroke-border" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <p className="mt-2 text-caption font-semibold">{job.title}</p>
      {detail && <p className="text-caption text-muted-foreground">{detail}</p>}
    </li>
  );
}
