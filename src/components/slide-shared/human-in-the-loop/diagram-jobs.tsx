import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { chatNames, focalCriteria, splitParked } from './diagram-model.pure';
import { Check, FlowStub, ParkedStub, Sparkle } from './glyphs';
import type { JobSlot } from './human-in-the-loop.types';
import { NodePopover, type NodeCopy } from './node-popover.client';
import type { Job } from './workflow.types';

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

export interface JobViewProps {
  readonly job: Job;
  readonly slot: JobSlot;
  /** The word for this job's stage gate; absent when the stage has none. */
  readonly gate?: string;
  readonly words: { readonly signedOff: string; readonly checked: string };
}

const PIECE = 'flex h-full min-w-0 flex-1 items-center rounded-full px-3 text-left text-caption';

/** The task's pieces: the one taken forward in the middle, the parked ones grey, each ending in a stub. */
export function PieceJobs({ job, slot }: JobViewProps) {
  const { before, after } = splitParked(job.parked ?? []);
  const piece = (label: string, parked: boolean) => {
    const tone = parked
      ? 'bg-muted text-muted-foreground'
      : 'border border-foreground bg-card font-semibold text-foreground';
    return (
      <li key={`${parked}-${label}`} className="flex h-9 items-center gap-1.5">
        <Node copy={slot.popover} className={cn(PIECE, tone)}>
          {label}
        </Node>
        {parked ? <ParkedStub /> : <FlowStub />}
      </li>
    );
  };
  return [...before.map((l) => piece(l, true)), piece(job.title, false), ...after.map((l) => piece(l, true))];
}

/** A job the AI does, as a card: the sparkle and its title, then its detail and, where it is gated, the gate. */
export function AiJob({ job, slot, gate }: JobViewProps) {
  const detail = slot.detail ?? job.detail;
  return (
    <>
      <li className={cn('flex flex-col gap-1 rounded-2xl p-3', AI_EDGE)}>
        <span className="flex items-center gap-1.5 text-caption font-semibold">
          <Sparkle className="size-3.5" />
          {job.title}
        </span>
        {detail && <span className="text-caption text-muted-foreground">{detail}</span>}
        {gate && (
          <span className="mt-1 inline-flex items-center gap-1 text-caption font-medium">
            {gate}
            {slot.marker}
          </span>
        )}
      </li>
      {slot.after && <li className="flex justify-center">{slot.after}</li>}
    </>
  );
}

/** The focal job as a card, the one focal point: its gate, its criteria, signed off. */
export function FocalJob({ job, slot, gate, words }: JobViewProps) {
  const criteria = slot.criteria ?? focalCriteria(job);
  return (
    <li className="-rotate-1 rounded-xl border border-border bg-background p-2.5 shadow-md">
      {gate && <p className="text-caption font-medium text-muted-foreground uppercase">{gate}</p>}
      <p className="text-caption font-semibold">{job.title}</p>
      {criteria.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1 border-t border-border pt-2 text-caption text-muted-foreground">
          {criteria.map((criterion) => (
            <li key={criterion}>{criterion}</li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <p className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-caption font-semibold text-primary-foreground">
          <Check className="size-3.5" />
          {words.signedOff}
        </p>
        {slot.marker}
      </div>
    </li>
  );
}

const CHAT_PILL = 'flex h-12 w-full items-center justify-between gap-2 rounded-full px-3 text-caption font-semibold';

/** The parallel chats of a fanned-out job, each ticked where the job is checked against its criteria. */
export function ChatJobs({ job, slot, words }: JobViewProps) {
  return chatNames(job).map((name) => (
    <li key={name}>
      <Node copy={slot.popover} className={cn(CHAT_PILL, AI_EDGE)}>
        <span className="flex min-w-0 items-center gap-1.5">
          <Sparkle className="size-3.5" />
          <span className="truncate">{name}</span>
        </span>
        {job.check && (
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
