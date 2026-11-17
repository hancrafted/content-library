import type { ReactNode } from 'react';

function Heading({ title, note }: { title: string; note?: string }) {
  if (!note) return <b className="font-semibold">{title}</b>;
  return (
    <span className="flex flex-wrap items-baseline gap-x-3">
      <b className="font-semibold">{title}</b>
      <span className="text-muted-foreground">{note}</span>
    </span>
  );
}

export function ToolPreview({
  label,
  title,
  tag,
  note,
  children,
}: {
  label: string;
  title: string;
  tag?: string;
  note?: string;
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
        <Heading title={title} note={note} />
        {tag && (
          <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 whitespace-nowrap font-semibold">{tag}</span>
        )}
      </div>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}
