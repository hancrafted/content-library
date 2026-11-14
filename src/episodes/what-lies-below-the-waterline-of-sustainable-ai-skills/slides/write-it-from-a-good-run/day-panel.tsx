import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneCard } from '@/episodes/components/slide-shared/iceberg/zone-card';
import type { TargetProps } from '@/shared/lib/context-link.pure';
import { cn } from '@/shared/lib/utils';
import type { CSSProperties, ReactNode } from 'react';
import styles from './slide.module.css';

/** The context window a panel's picture ends on: full in the evening, empty the next morning. */
export function ContextGauge({ label, state }: { readonly label: string; readonly state: 'full' | 'empty' }) {
  return (
    <ZoneCard
      data-gauge={state}
      className="mx-3 mt-2 rounded-md px-2 py-1 font-mono text-caption font-semibold shadow-sm"
    >
      {label}
      <span className="mt-1 block h-2 rounded-full border border-foreground">
        <span
          className={cn(
            styles.gauge,
            'block h-full rounded-full bg-foreground',
            state === 'full' ? 'w-[92%]' : cn(styles.drop, 'w-[92%]'),
          )}
        />
      </span>
    </ZoneCard>
  );
}

interface DayPanelProps {
  readonly n: number;
  readonly step: ReactNode;
  readonly time: string;
  readonly ai: string;
  readonly picture: ReactNode;
  readonly chat?: ReactNode;
  readonly coding?: ReactNode;
  readonly focal?: boolean;
  /** Marks the panel as the element one of the Slide's notes explains. */
  readonly marked?: TargetProps;
}

/** The panel's number badge, primary on the panel in focus, and its AI step. */
function StepHeading({ n, step, focal }: Pick<DayPanelProps, 'n' | 'step' | 'focal'>) {
  return (
    <p className="flex items-center gap-2 text-body font-semibold">
      <span
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-full text-caption',
          focal ? 'bg-primary text-primary-foreground' : 'bg-foreground text-card',
        )}
      >
        {n}
      </span>
      <span data-step>{step}</span>
    </p>
  );
}

/** One panel of the day: its picture, its numbered AI step, the story's hour, and each view's extra. */
export function DayPanel({ n, step, time, ai, picture, chat, coding, focal, marked }: DayPanelProps) {
  return (
    <li
      {...marked}
      data-day-panel={n}
      data-focal={focal ? '' : undefined}
      style={{ '--panel': n - 1 } as CSSProperties}
      className={cn(styles.panel, 'focus-group__item card-hover card-hover--raise min-w-0')}
    >
      <ZoneCard
        className={cn('flex h-full flex-col overflow-hidden rounded-lg shadow-md', focal && 'ring-2 ring-foreground')}
      >
        <div className="relative">{picture}</div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <StepHeading n={n} step={step} focal={focal} />
          <p className="pl-8 text-caption text-muted-foreground">{time}</p>
          <p className="text-caption">{ai}</p>
          <InView view="chat" as="div" className="flex flex-col items-start gap-2 empty:hidden">
            {chat}
          </InView>
          <InView view="coding" as="div" className="text-caption empty:hidden">
            {coding}
          </InView>
        </div>
      </ZoneCard>
    </li>
  );
}
