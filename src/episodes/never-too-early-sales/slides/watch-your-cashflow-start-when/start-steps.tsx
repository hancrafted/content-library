import { cn } from '@/lib/utils';
import { StepIcon, type StepSlug } from './step-icon';

/** The four steps, in the order the voice names them. */
export const STEP_SLUGS: readonly StepSlug[] = ['s1', 's2', 's3', 's4'];

interface Step {
  slug: StepSlug;
  title: string;
  detail: string;
}

/**
 * The lane of this week's four steps: one wide lane under a dark pill, four neutral paper notes at alternating
 * tilts, each a number, a small drawing, a title and a detail line. Four in a row when the lane is wide, two by two
 * when it is not. A step lifts when pointed at.
 */
export function StartSteps({ label, steps }: { label: string; steps: readonly Step[] }) {
  return (
    <section className="relative rounded-xl border bg-muted px-4 pt-12 pb-6 @min-[38rem]:px-8 @min-[38rem]:pb-8">
      <h4 className="absolute -top-4 left-4 rounded-full bg-foreground px-6 py-1.5 text-caption font-medium text-background shadow-md @min-[38rem]:left-8 @min-[38rem]:px-10">
        {label}
      </h4>
      <ol role="list" className="grid grid-cols-2 gap-4 @min-[38rem]:grid-cols-4 @min-[38rem]:gap-6">
        {steps.map(({ slug, title, detail }, index) => (
          <li
            key={slug}
            data-step={slug}
            className={cn(
              'card-hover card-hover--raise flex min-w-0 flex-col gap-3 border border-border bg-card p-4 shadow-md @min-[38rem]:p-5',
              index % 2 === 0 ? '-rotate-1' : 'rotate-1',
            )}
          >
            <span className="font-mono text-caption font-semibold text-muted-foreground">
              {String(index + 1).padStart(2, '0')}
            </span>
            <StepIcon slug={slug} />
            <span className="text-body font-semibold break-words">{title}</span>
            <span className="text-caption text-muted-foreground">{detail}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
