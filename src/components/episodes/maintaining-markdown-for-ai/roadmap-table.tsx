import type { TargetProps } from '@/components/slide-master/episode-record';

function ShippedCol(target: TargetProps) {
  return (
    <div {...target} className="flex flex-col rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-primary/20 pb-4">
        <span className="font-mono text-sm font-bold text-primary">v0.0.4 Shipped</span>
        <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-primary">
          ✓ Available now
        </span>
      </div>
      <ul className="mt-4 space-y-3 font-mono text-xs text-foreground/90">
        <li className="flex items-start gap-2">
          <span className="text-primary font-bold">✓</span>
          <span>Frontmatter linting — field constraints declared per path</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-primary font-bold">✓</span>
          <span>Staleness checking — stale_after against a stated instant</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-primary font-bold">✓</span>
          <span>Markdown harness skill — skill to install and configure harness</span>
        </li>
      </ul>
    </div>
  );
}

function PlannedCol(target: TargetProps) {
  return (
    <div {...target} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <span className="font-mono text-sm font-bold text-muted-foreground">Planned Roadmap</span>
        <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 font-mono text-xs font-semibold text-muted-foreground">
          In progress
        </span>
      </div>
      <ul className="mt-4 space-y-3 font-mono text-xs text-muted-foreground">
        <li className="flex items-start gap-2">
          <span className="font-bold text-muted-foreground/60">○</span>
          <span>Drift detection — semantic checks against git commit diffs</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="font-bold text-muted-foreground/60">○</span>
          <span>Corpus validation — cross-file reference integrity</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="font-bold text-muted-foreground/60">○</span>
          <span>GitHub Action — automated verification in CI pipelines</span>
        </li>
      </ul>
    </div>
  );
}

export function RoadmapTable({ shipped, planned }: { shipped: TargetProps; planned: TargetProps }) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
      <ShippedCol {...shipped} />
      <PlannedCol {...planned} />
    </div>
  );
}
