import { Glyph } from '@/explorables/software-ecology/factory-glyph-view';
import { ContextIcon } from '@/shared/components/ui/context-icon';
import type { ReactNode } from 'react';

export interface ToolbarStillProps {
  /** The state row's states, in the Explorable's order. */
  readonly states: readonly string[];
  /** The Scenarios button, shown picked. */
  readonly scenarios: string;
  /** The Tour button, shown running. */
  readonly tour: string;
  /** The speed menu's face, the speed Play resumes at. */
  readonly speed: string;
  /** The tour's clock. */
  readonly clock: string;
  /** The use case picker's name. */
  readonly useCase: string;
  /** The pin that points at the row. */
  readonly pin: ReactNode;
}

const PILL = 'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-caption';
const LINE = 'border border-border bg-card text-foreground';
const PICKED = 'bg-foreground font-semibold text-background';
const GROUP = 'inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-0.5';
const ICON = 'size-3.5 text-muted-foreground';

/** The roles state, Ideal and Realistic as one segmented group; Scenarios picked; Tour running; the marker. */
function StateRow({ states, scenarios, tour }: Pick<ToolbarStillProps, 'states' | 'scenarios' | 'tour'>) {
  return (
    <>
      <span className={`${PILL} ${LINE} gap-2.5 px-3`}>
        {states.map((state) => (
          <span key={state}>{state}</span>
        ))}
      </span>
      <span className={`${PILL} ${PICKED}`}>
        {scenarios} <span>▾</span>
      </span>
      <span className={`${PILL} ${PICKED}`}>
        <Glyph name="play" className="size-3" />
        {tour}
      </span>
      <ContextIcon className={ICON} />
    </>
  );
}

/** Paused at the tour's step: Play, the speed Play resumes at, Clear and the tour's clock. */
function TimeGroup({ speed, clock }: Pick<ToolbarStillProps, 'speed' | 'clock'>) {
  return (
    <span className={`${GROUP} text-caption font-semibold text-foreground tabular-nums`}>
      <Glyph name="play" className={ICON} />
      <span>
        {speed} <span className="text-muted-foreground">▾</span>
      </span>
      <Glyph name="clear" className={ICON} />
      <span>{clock}</span>
    </span>
  );
}

/** The use case picker and Settings, at the row's end. */
function RowEnd({ useCase }: Pick<ToolbarStillProps, 'useCase'>) {
  return (
    <span className="ml-auto inline-flex items-center gap-1.5">
      <span className={`${GROUP} text-caption font-semibold text-foreground`}>
        <Glyph name="factory" className={ICON} />
        {useCase} <span className="text-muted-foreground">▾</span>
      </span>
      <span className={GROUP}>
        <Glyph name="settings" className={ICON} />
      </span>
    </span>
  );
}

/**
 * The Explorable's one-row toolbar as a still (feedback 08), at the tour's step: the states, Scenarios picked and Tour
 * running, the Context marker; Compare; paused, the speed, Clear and the tour's clock; the use case; Settings.
 */
export function ToolbarStill(p: ToolbarStillProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" aria-hidden="true">
      {p.pin}
      <StateRow {...p} />
      <span className={GROUP}>
        <Glyph name="compare" className={ICON} />
      </span>
      <TimeGroup {...p} />
      <RowEnd {...p} />
    </div>
  );
}
