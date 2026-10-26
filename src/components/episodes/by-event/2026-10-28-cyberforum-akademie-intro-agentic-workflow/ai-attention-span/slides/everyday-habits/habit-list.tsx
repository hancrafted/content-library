import type { TargetProps } from '@/lib/context-link.pure';
import type { ReactNode } from 'react';

const HABIT = 'focus-group__item card-hover card-hover--raise flex flex-col gap-2 rounded-xl bg-card p-5 shadow-md';

/** One habit: its title and body, the Context marker after its title, and the target its Speaker note lights, if any. */
export interface Habit {
  readonly title: string;
  readonly body: ReactNode;
  readonly marker?: ReactNode;
  /** Set when a Speaker note lights this habit. */
  readonly target?: TargetProps;
}

/** The everyday habits as numbered cards, three to a row; pointing at one dims the others. */
export function HabitList({ label, habits }: { label: string; habits: readonly Habit[] }) {
  return (
    <ol aria-label={label} className="focus-group focus-group--dim-others grid gap-5 md:grid-cols-3">
      {habits.map((habit, at) => (
        <li key={habit.title} {...habit.target} className={HABIT}>
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-full bg-primary text-caption font-semibold text-primary-foreground"
          >
            {at + 1}
          </span>
          <p className="flex items-start gap-1 text-body font-semibold">
            <span>{habit.title}</span>
            {habit.marker}
          </p>
          <p className="text-caption text-muted-foreground">{habit.body}</p>
        </li>
      ))}
    </ol>
  );
}
