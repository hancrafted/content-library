export interface StripColumn {
  readonly slug: string;
  readonly label: string;
  readonly steps: number;
}

export function DraftStrip({ label, columns, note }: { label: string; columns: readonly StripColumn[]; note: string }) {
  return (
    <div data-draft-strip className="flex flex-col gap-3 rounded-xl bg-muted p-5 opacity-60 @3xl:p-6">
      <p className="text-caption font-semibold text-muted-foreground uppercase">{label}</p>
      <div className="flex flex-wrap items-end gap-6">
        {columns.map((column) => (
          <div key={column.slug} className="flex flex-col gap-1">
            <span data-draft-column className="text-caption">
              {column.label}
            </span>
            <span className="flex flex-wrap gap-1" aria-hidden="true">
              {Array.from({ length: column.steps }, (_, at) => (
                <span key={at} className="h-4 w-6 rounded-sm bg-card shadow-sm" />
              ))}
            </span>
          </div>
        ))}
        <span className="text-caption text-muted-foreground @3xl:ml-auto">{note}</span>
      </div>
    </div>
  );
}
