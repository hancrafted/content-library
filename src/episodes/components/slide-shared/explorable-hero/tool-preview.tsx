import type { ReactNode } from 'react';

/**
 * The lightweight stand-in for an Explorable that peeks up from the hero's bottom edge: a card with a title row and
 * whatever the Slide draws in it. Decorative, so it is one image to assistive technology, named by `label`; it owns no
 * words.
 */
export function ToolPreview({
  label,
  title,
  tag,
  children,
}: {
  label: string;
  title: string;
  tag?: string;
  children: ReactNode;
}) {
  return (
    <div
      role="img"
      data-tone-flip
      aria-label={label}
      className="w-full rounded-t-[20px] border border-border bg-card p-4 text-caption text-card-foreground"
    >
      <div className="mb-3.5 flex items-center justify-between gap-2" aria-hidden="true">
        <b className="font-semibold">{title}</b>
        {tag && <span className="rounded-full bg-muted px-2.5 py-0.5 font-semibold">{tag}</span>}
      </div>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}
