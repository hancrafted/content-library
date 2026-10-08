/** One story's copy, resolved from the catalog on the server; plain data so it crosses to the client. */
export interface StoryCardCopy {
  id: string;
  title: string;
  caption: string;
  labels: string[];
  statValue: number;
  statDecimals: number;
  statUnit: string;
  statLabel: string;
}

/** A story card: title, the one number that proves it, one sentence, and where it happened underneath. */
export function StoryCard({ story, stat }: { story: StoryCardCopy; stat: string }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6">
      <h3 className="text-base font-semibold leading-snug tracking-tight text-foreground">{story.title}</h3>
      <p className="mt-5 flex items-baseline gap-2 text-foreground">
        <span className="text-5xl font-semibold tabular-nums tracking-tight">{stat}</span>
        <span className="text-base text-muted-foreground">{story.statUnit}</span>
      </p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{story.statLabel}</p>
      <p className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-6 text-xs text-muted-foreground">
        <span className="font-medium text-foreground/80">{story.caption}</span>
        {story.labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </p>
    </div>
  );
}
