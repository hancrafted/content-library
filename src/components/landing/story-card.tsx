/** One story's copy, resolved from the Translation file on the server; plain data so it crosses to the client. */
export interface StoryCardCopy {
  id: string;
  title: string;
  /** The stat as written (`~5`, `50+`, `15–20`); empty when the story has no number to stand on. */
  stat: string;
  statUnit: string;
  description: string;
  /** Where it happened first (the client or engagement), then its themes; the first one is emphasised. */
  labels: string[];
}

function Stat({ stat, unit }: { stat: string; unit: string }) {
  return (
    <p className="mt-6 flex flex-wrap items-baseline gap-x-2 text-foreground">
      <span className="text-5xl font-semibold tabular-nums tracking-tight">{stat}</span>
      <span className="text-base text-muted-foreground">{unit}</span>
    </p>
  );
}

/** A story card: title, the one number that proves it, what happened, and where it happened underneath. */
export function StoryCard({ story, shownStat }: { story: StoryCardCopy; shownStat: string }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-7">
      <h3 className="text-base font-semibold leading-snug tracking-tight text-foreground">{story.title}</h3>
      {story.stat && <Stat stat={shownStat} unit={story.statUnit} />}
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{story.description}</p>
      <p className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-8 text-xs text-muted-foreground">
        {story.labels.map((label, index) => (
          <span key={label} className={index === 0 ? 'font-medium text-foreground/80' : undefined}>
            {label}
          </span>
        ))}
      </p>
    </div>
  );
}
