import { isComplete, type DashboardState } from '@/lib/dashboard-stages.pure';
import { Check, Circle, CircleAlert, Play, X, type LucideIcon } from 'lucide-react';

const ICONS: Partial<Record<DashboardState, LucideIcon>> = {
  running: Play,
  gate: CircleAlert,
  refused: CircleAlert,
  crashed: X,
  error: X,
};

export function StageStateIcon({ state, className = 'size-5' }: { state: DashboardState; className?: string }) {
  const Icon = isComplete(state) ? Check : (ICONS[state] ?? Circle);
  return <Icon aria-hidden="true" className={`${className} shrink-0`} />;
}

/** The exclamation mark on a Job that needs Han; its label names it for screen readers and on hover. */
export function AttentionMarker({ attention, label }: { attention: boolean; label: string }) {
  if (!attention) return null;
  return (
    <span role="img" aria-label={label} title={label} className="inline-flex shrink-0 text-(--warning)">
      <CircleAlert aria-hidden="true" className="size-4" />
    </span>
  );
}
