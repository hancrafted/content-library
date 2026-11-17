import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { DoneMark } from '../agent-setup-step/done-mark';

interface DoneStripProps {
  readonly label: string;
  readonly children: ReactNode;
}

export function DoneStrip({ label, children }: DoneStripProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-(--success) bg-(--success)/10 p-4" data-done-strip="">
      <p className="inline-flex items-center gap-2 text-caption font-semibold uppercase text-muted-foreground">
        <DoneMark />
        {label}
      </p>
      <div className="text-body">{children}</div>
    </div>
  );
}

interface MoreHelpProps {
  readonly title: string;
  readonly children: ReactNode;
}

export function MoreHelp({ title, children }: MoreHelpProps) {
  return (
    <details className="group rounded-lg border border-border bg-background px-4 py-1" data-more-help="">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-body font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown aria-hidden="true" className="size-4 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="flex flex-col gap-4 pt-2 pb-4">{children}</div>
    </details>
  );
}

interface StepDoneBadgeProps {
  readonly ready: boolean;
  readonly label: string;
}

export function StepDoneBadge({ ready, label }: StepDoneBadgeProps) {
  if (!ready) return null;
  return (
    <p
      className="inline-flex items-center gap-2 self-start rounded-full border border-(--success) bg-(--success)/10 px-3 py-1 text-caption font-semibold"
      data-step-done=""
    >
      <DoneMark />
      {label}
    </p>
  );
}
