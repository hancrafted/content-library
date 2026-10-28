import { cn } from '@/shared/lib/utils';
import { useId, type ReactNode } from 'react';

/*
 * The readme an Explorable Slide carries about its Preset: what it shows, what to try, what to notice.
 * A static server part: the Slide hands it every word. Three short items side by side on a wide container, stacked on
 * a narrow one, so the visual below keeps the whole width.
 * Collapsed, it folds into a native disclosure: still server-rendered, its text in the static HTML.
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
  /** Folds the items under the heading, closed, for a page whose visual must fit the first screen. */
  readonly collapsed?: boolean;
  readonly className?: string;
}

function Head({ id, heading, preset }: { readonly id: string; readonly heading: string; readonly preset?: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <h4 id={id} className="text-body font-semibold text-foreground">
        {heading}
      </h4>
      {preset ? <code className="text-caption text-muted-foreground">{preset}</code> : null}
    </div>
  );
}

function Items({ items }: { readonly items: readonly PresetReadmeItem[] }) {
  return (
    <dl className="grid gap-3 @3xl:grid-cols-3 @3xl:gap-6">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-1">
          <dt className="text-caption tracking-wide text-muted-foreground uppercase">{item.label}</dt>
          <dd className="max-w-prose text-body text-pretty text-foreground">{item.text}</dd>
        </div>
      ))}
    </dl>
  );
}

/** The always-visible line of a collapsed readme: a chevron that turns when open, then the heading. */
function Summary({ children }: { readonly children: ReactNode }) {
  return (
    <summary className="flex cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
      <svg
        viewBox="0 0 8 10"
        aria-hidden="true"
        className="size-2.5 shrink-0 fill-current text-muted-foreground transition-transform group-open:rotate-90"
      >
        <path d="M0 0l8 5-8 5z" />
      </svg>
      {children}
    </summary>
  );
}

export function PresetReadme({ heading, preset, items, collapsed, className }: PresetReadmeProps) {
  const id = useId();
  const head = <Head id={id} heading={heading} preset={preset} />;
  return (
    <section
      aria-labelledby={id}
      className={cn('@container flex flex-col gap-3 rounded-xl border border-border bg-card p-4 md:p-5', className)}
    >
      {collapsed ? (
        <details className="group flex flex-col gap-3">
          <Summary>{head}</Summary>
          <Items items={items} />
        </details>
      ) : (
        <>
          {head}
          <Items items={items} />
        </>
      )}
    </section>
  );
}
