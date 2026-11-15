import type { ReactNode } from 'react';

export interface WellKnownCalloutProps {
  readonly label: string;
  readonly items: readonly { readonly slug: string; readonly lead: string; readonly text: ReactNode }[];
}

/**
 * The call-out naming the method as well known: a card note with a `primary` left edge and an outline pill, adding no
 * fill, so the goal note stays the Scene's only `bg-primary`.
 */
export function WellKnownCallout({ label, items }: WellKnownCalloutProps) {
  return (
    <aside
      aria-label={label}
      className="flex flex-col gap-3 rounded-lg border-l-4 border-primary bg-card p-5 shadow-md"
    >
      <span className="self-start rounded-full border border-foreground px-2 text-caption uppercase">{label}</span>
      {items.map(({ slug, lead, text }) => (
        <p key={slug} data-callout-item={slug} className="text-body">
          <b className="font-semibold">{lead}</b> {text}
        </p>
      ))}
    </aside>
  );
}
