export interface BenchJobsProps {
  readonly yours: { readonly label: string; readonly items: readonly { title: string; hint: string }[] };
  readonly notYours: { readonly label: string; readonly text: string };
}

/** Your two jobs at the bench, edged in `human`, and the one that is not yours, edged in `ai`. */
export function BenchJobs({ yours, notYours }: BenchJobsProps) {
  return (
    <>
      <div className="rounded-xl border-l-4 border-human bg-card p-5 shadow-md">
        <p className="text-caption text-human uppercase">{yours.label}</p>
        <ol className="mt-2 flex flex-col gap-2 text-body">
          {yours.items.map(({ title, hint }) => (
            <li key={title} className="flex flex-col">
              <span className="font-semibold">{title}</span>
              <span className="text-caption text-muted-foreground">{hint}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="rounded-xl border-l-4 border-ai bg-card p-5">
        <p className="text-caption text-ai uppercase">{notYours.label}</p>
        <p className="mt-2 text-body">{notYours.text}</p>
      </div>
    </>
  );
}
