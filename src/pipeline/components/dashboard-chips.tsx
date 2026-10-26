import { fillTemplate } from '@/lib/template.pure';
import type { CheckChip, SkillChip } from '@/pipeline/lib/dashboard-chips.pure';
import type { DashboardJob } from '@/pipeline/lib/dashboard-projection.pure';
import { Check, CircleDashed, X, type LucideIcon } from 'lucide-react';
import type { DashboardCopy } from './dashboard-evidence';

type ChipState = SkillChip['state'] | CheckChip['state'];

const TONE: Record<ChipState, string> = {
  pending: 'border-border text-muted-foreground',
  run: 'border-(--success)/40 bg-(--success)/10 text-(--success)',
  pass: 'border-(--success)/40 bg-(--success)/10 text-(--success)',
  skipped: 'border-destructive/40 bg-destructive/10 text-destructive',
  fail: 'border-destructive/40 bg-destructive/10 text-destructive',
};

const ICON: Record<ChipState, LucideIcon> = { pending: CircleDashed, run: Check, pass: Check, skipped: X, fail: X };

interface ChipProps {
  kind: 'skill' | 'check';
  name: string;
  state: ChipState;
  copy: DashboardCopy;
  /** The jobs view: the icon alone, the name and state for screen readers and on hover. */
  compact?: boolean;
}

/** One skill or check: its state in colour, icon and words, the words for screen readers and on hover. */
function Chip({ kind, name, state, copy, compact = false }: ChipProps) {
  const Icon = ICON[state];
  const label = fillTemplate(copy.chips.label, {
    kind: copy.chips.kinds[kind],
    name,
    state: copy.chips.states[state],
  });
  return (
    <li
      title={label}
      data-chip={`${kind}:${name}`}
      data-chip-state={state}
      className={`inline-flex max-w-full min-w-0 items-center gap-1 rounded-md border text-caption ${compact ? 'p-0.5' : 'px-1.5 py-0.5'} ${TONE[state]}`}
    >
      <Icon aria-hidden="true" className="size-3.5 shrink-0" />
      {compact ? null : (
        <span aria-hidden="true" className="min-w-0 font-mono wrap-anywhere">
          {name}
        </span>
      )}
      <span className="sr-only">{label}</span>
    </li>
  );
}

const DONE: ReadonlySet<ChipState> = new Set(['run', 'pass']);

interface RowProps {
  heading: string;
  chips: ChipProps[];
  compact?: boolean;
}

/** A labelled row of chips; compact, the label counts those done. */
function ChipRow({ heading, chips, compact = false }: RowProps) {
  if (chips.length === 0) return null;
  const done = chips.filter((chip) => DONE.has(chip.state)).length;
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1">
      <span className="text-caption text-muted-foreground">
        {heading}
        {compact ? <span className="font-mono tabular-nums"> {`${done}/${chips.length}`}</span> : null}
      </span>
      <ul aria-label={heading} className="flex min-w-0 flex-wrap gap-1">
        {chips.map((chip) => (
          <Chip key={`${chip.kind}:${chip.name}`} {...chip} compact={compact} />
        ))}
      </ul>
    </div>
  );
}

const skillChips = (chips: readonly SkillChip[], copy: DashboardCopy): ChipProps[] =>
  chips.map(({ name, state }) => ({ kind: 'skill', name, state, copy }));
const checkChips = (chips: readonly CheckChip[], copy: DashboardCopy): ChipProps[] =>
  chips.map(({ name, state }) => ({ kind: 'check', name, state, copy }));

/** The jobs view: a Job's skills, once each, and its checks, as two rows of icons. */
export function JobChipList({ job, copy }: { job: DashboardJob; copy: DashboardCopy }) {
  const { skills, checks } = job.chips;
  if (skills.length === 0 && checks.length === 0) return null;
  return (
    <div className="mt-1 ml-2 space-y-1" data-job-chips={job.id} aria-label={copy.chips.title} role="group">
      <ChipRow heading={copy.chips.skills} chips={skillChips(skills, copy)} compact />
      <ChipRow heading={copy.chips.checks} chips={checkChips(checks, copy)} compact />
    </div>
  );
}

/** The Job card: each agent's listed skills in its own state, under its type, then the Job's checks. */
export function JobChipDetail({ job, copy }: { job: DashboardJob; copy: DashboardCopy }) {
  const { agents, checks } = job.chips;
  if (agents.length === 0 && checks.length === 0) return null;
  return (
    <section className="space-y-2" data-job-chip-detail={job.id}>
      <h3 className="text-body font-medium">{copy.chips.title}</h3>
      <p className="text-caption text-muted-foreground">{copy.chips.help}</p>
      {agents.map((agent) => (
        <ChipRow
          key={`${agent.type}:${agent.session ?? 'subagent'}`}
          heading={[agent.type, agent.session].filter(Boolean).join(' · ')}
          chips={skillChips(agent.skills, copy)}
        />
      ))}
      <ChipRow heading={copy.chips.checks} chips={checkChips(checks, copy)} />
    </section>
  );
}
