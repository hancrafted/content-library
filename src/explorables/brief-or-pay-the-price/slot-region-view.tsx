import type { ReactNode } from 'react';

export function SlotRegionView({
  slot,
  label,
  children,
}: {
  readonly slot: string;
  readonly label: string;
  readonly children?: ReactNode;
}) {
  if (children === undefined || children === null) return null;
  return (
    <section aria-label={label} data-slot={slot} className="rounded-lg border border-border bg-card p-3 @3xl:p-4">
      {children}
    </section>
  );
}
