import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { Check, FlowStub, ParkedStub, Sparkle } from './glyphs';
import { NodePopover, type NodeCopy } from './node-popover.client';
import type { Job } from './venue-pipeline.pure';

/** The `ai` edge on a job the AI does: a fresh chat. */
const AI_EDGE = 'border border-ai/50 bg-card shadow-md shadow-ai/15';

const NODE_BUTTON =
  'cursor-pointer outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring';

const PIECE = 'flex h-full min-w-0 flex-1 items-center rounded-full px-3 text-left text-caption';

interface JobListProps {
  jobs: readonly Job[];
  names: Record<string, string>;
  popover: NodeCopy;
}

/** The party's five pieces: the venue, taken forward, in the middle; the four parked ones grey, each ending in a stub. */
export function PartyPieces({ jobs, names, popover }: JobListProps) {
  return jobs.map((job) => {
    const parked = job.kind === 'parked';
    const tone = parked
      ? 'bg-muted text-muted-foreground'
      : 'border border-foreground bg-card font-semibold text-foreground';
    return (
      <li key={job.id} className="flex h-9 items-center gap-1.5">
        <NodePopover copy={popover} className={cn(NODE_BUTTON, PIECE, tone)}>
          {names[job.id]}
        </NodePopover>
        {parked ? <ParkedStub /> : <FlowStub />}
      </li>
    );
  });
}

/** A job the AI does, as a card: the sparkle and its label, then what it holds. */
function AiCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <li className={cn('flex flex-col gap-1 rounded-2xl p-3', AI_EDGE)}>
      <span className="flex items-center gap-1.5 text-caption font-semibold">
        <Sparkle className="size-3.5" />
        {label}
      </span>
      {children}
    </li>
  );
}

interface InterviewJobProps {
  label: string;
  detail: string;
  forgot: ReactNode;
  chat: ReactNode;
}

/** The interview job: the AI asks you three questions, one you forgot, and "See the chat" opens the worked chat. */
export function InterviewJob({ label, detail, forgot, chat }: InterviewJobProps) {
  return (
    <>
      <AiCard label={label}>
        <span className="text-caption text-muted-foreground">
          {detail}
          <br />
          {forgot}
        </span>
      </AiCard>
      <li className="flex justify-center">{chat}</li>
    </>
  );
}

interface RequirementsCardProps {
  gate: string;
  title: string;
  criteria: readonly string[];
  signOff: string;
  marker: ReactNode;
}

/** The requirements card, the one focal point: Gate 1, five criteria from the chat's answers, signed off. */
export function RequirementsCard({ gate, title, criteria, signOff, marker }: RequirementsCardProps) {
  return (
    <li className="-rotate-1 rounded-xl border border-border bg-background p-2.5 shadow-md">
      <p className="text-caption font-medium text-muted-foreground uppercase">{gate}</p>
      <p className="text-caption font-semibold">{title}</p>
      <ul className="mt-2 flex flex-col gap-1 border-t border-border pt-2 text-caption text-muted-foreground">
        {criteria.map((criterion) => (
          <li key={criterion}>{criterion}</li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <p className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-caption font-semibold text-primary-foreground">
          <Check className="size-3.5" />
          {signOff}
        </p>
        {marker}
      </div>
    </li>
  );
}

const CHAT_PILL = 'flex h-12 w-full items-center justify-between gap-2 rounded-full px-3 text-caption font-semibold';

/** Three fresh chats, one per venue, each checked against the card; each opens the shared Research popover. */
export function ResearchChats({ jobs, names, popover, checked }: JobListProps & { checked: string }) {
  return jobs.map((job) => (
    <li key={job.id}>
      <NodePopover copy={popover} className={cn(NODE_BUTTON, CHAT_PILL, AI_EDGE)}>
        <span className="flex min-w-0 items-center gap-1.5">
          <Sparkle className="size-3.5" />
          <span className="truncate">{names[job.id]}</span>
        </span>
        {job.checked && (
          <span className="flex items-center text-muted-foreground">
            <Check className="size-4" />
            <span className="sr-only">{checked}</span>
          </span>
        )}
      </NodePopover>
    </li>
  ));
}

interface CompareJobProps {
  label: string;
  detail: string;
  gate: string;
  marker: ReactNode;
}

/** The comparison: the three venues ranked against the card, Gate 2. */
export function CompareJob({ label, detail, gate, marker }: CompareJobProps) {
  return (
    <AiCard label={label}>
      <span className="text-caption text-muted-foreground">{detail}</span>
      <span className="mt-1 inline-flex items-center gap-1 text-caption font-medium">
        {gate}
        {marker}
      </span>
    </AiCard>
  );
}

/** What comes out: the venue plan for your boss. */
export function VenuePlan({ label, detail }: { label: string; detail: string }) {
  return (
    <li className="relative rounded-xl border border-foreground bg-background p-3">
      <svg viewBox="0 0 80 40" className="h-8 w-full" aria-hidden="true">
        <path d="M2 6h60 M2 18h76 M2 30h48" className="fill-none stroke-border" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <p className="mt-2 text-caption font-semibold">{label}</p>
      <p className="text-caption text-muted-foreground">{detail}</p>
    </li>
  );
}

interface LegendProps {
  label: string;
  freshChat: ReactNode;
  checked: string;
  parked: string;
}

/** The legend under the pipeline: what the sparkle, the check and the stub mean. */
export function Legend({ label, freshChat, checked, parked }: LegendProps) {
  const entries = [
    { key: 'fresh', glyph: <Sparkle className="size-3.5" />, text: freshChat },
    { key: 'checked', glyph: <Check className="size-3.5" />, text: checked },
    { key: 'parked', glyph: <ParkedStub />, text: parked },
  ];
  return (
    <ul
      aria-label={label}
      className="flex flex-col gap-2 text-caption text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-6"
    >
      {entries.map(({ key, glyph, text }) => (
        <li key={key} className="flex items-center gap-2">
          {glyph}
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}
