import styles from './the-plan.module.css';

/** The ticks on the working day, at 09, 11, 13, 15 and 17, as fractions of the track. */
const TICKS = ['0%', '25%', '50%', '75%', '100%'] as const;

/**
 * The working day as an axis: a hairline track, a `primary` fill from start to due and a dot at the deadline, with
 * the two end labels inside the track's ends. `primary` marks only the deadline. The fill grows on entry and holds.
 */
export function DayAxis({ label, start, due }: { label: string; start: string; due: string }) {
  return (
    <figure aria-label={label} className="mt-12 md:mt-16">
      <div aria-hidden className="relative">
        <div className="h-px bg-border" />
        <div className={`absolute inset-x-0 top-0 h-0.5 -translate-y-1/4 origin-left bg-primary ${styles.fill}`} />
        {TICKS.map((left) => (
          <span key={left} style={{ left }} className="absolute top-0 h-2 w-px -translate-x-1/2 bg-border" />
        ))}
        <span
          className={`absolute top-0 right-0 size-3 translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ${styles.due}`}
        />
      </div>
      <div className="mt-4 flex justify-between font-mono text-caption tabular-nums">
        <span className="text-muted-foreground">{start}</span>
        <span className="font-semibold text-foreground">{due}</span>
      </div>
    </figure>
  );
}
