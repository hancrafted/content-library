import { cn } from '@/shared/lib/utils';
import { useId } from 'react';

/*
 * The readme an Explorable explanation Slide carries about its Preset: what it shows, what to try, what to notice.
 * A static server part: the Slide hands it every word. Three short items side by side on a wide container, stacked on
 * a narrow one, so the visual below keeps the whole width.
 */

export interface PresetReadmeItem {
  readonly label: string;
  readonly text: string;
}

export interface PresetReadmeProps {
  readonly heading: string;
  /** The Preset's id, shown as code; absent when the Slide shows no named Preset. */
  readonly preset?: string;
  readonly items: readonly PresetReadmeItem[];
  readonly className?: string;
}

export function PresetReadme({ heading, preset, items, className }: PresetReadmeProps) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className={cn('@container flex flex-col gap-3 rounded-xl border border-border bg-card p-4 md:p-5', className)}
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h4 id={id} className="text-body font-semibold text-foreground">
          {heading}
        </h4>
        {preset ? <code className="text-caption text-muted-foreground">{preset}</code> : null}
      </div>
      <dl className="grid gap-3 @3xl:grid-cols-3 @3xl:gap-6">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col gap-1">
            <dt className="text-caption tracking-wide text-muted-foreground uppercase">{item.label}</dt>
            <dd className="max-w-prose text-body text-pretty text-foreground">{item.text}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
