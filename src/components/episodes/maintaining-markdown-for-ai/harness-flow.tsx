import type { TargetProps } from '@/lib/context-link.pure';

function HarnessTriggers() {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">3 Entry Triggers</p>
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <p className="font-mono text-xs font-bold text-foreground">1. Agent read</p>
        <p className="mt-1 text-xs text-muted-foreground">Pre-read hook intercepts document read before injection.</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <p className="font-mono text-xs font-bold text-foreground">2. Git commit</p>
        <p className="mt-1 text-xs text-muted-foreground">Pre-commit husky gate blocks invalid frontmatter.</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <p className="font-mono text-xs font-bold text-foreground">3. Manual / CI run</p>
        <p className="mt-1 text-xs text-muted-foreground">CLI command `mh check` verifies entire corpus.</p>
      </div>
    </div>
  );
}

function HarnessHub() {
  return (
    <div className="flex flex-col justify-center rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-5 shadow-xs">
      <p className="text-center font-mono text-[11px] font-semibold uppercase tracking-wider text-primary">
        the same core, every time
      </p>
      <div className="mt-4 space-y-2">
        <div className="rounded-lg border border-primary/40 bg-card p-3 text-center">
          <span className="block text-xs font-semibold text-foreground">Retrieve configuration</span>
          <span className="block font-mono text-[11px] text-primary">config.yaml ↗</span>
        </div>
        <p className="text-center font-mono text-xs text-muted-foreground">↓</p>
        <div className="rounded-lg border border-primary/40 bg-card p-3 text-center">
          <span className="block text-xs font-semibold text-foreground">Deterministic validation</span>
          <span className="block font-mono text-[11px] text-muted-foreground">pure function</span>
        </div>
      </div>
    </div>
  );
}

function HarnessOutcomes() {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        3 Corresponding Outcomes
      </p>
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <p className="font-mono text-xs font-bold text-accent">Steer or block</p>
        <p className="mt-1 text-xs text-muted-foreground">Injects freshness warning or denies stale knowledge.</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <p className="font-mono text-xs font-bold text-secondary">Prevent drift</p>
        <p className="mt-1 text-xs text-muted-foreground">Rejects commits lacking mandatory metadata fields.</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <p className="font-mono text-xs font-bold text-primary">Report corpus health</p>
        <p className="mt-1 text-xs text-muted-foreground">Outputs JSON violation summary for build pipelines.</p>
      </div>
    </div>
  );
}

export function HarnessFlow(target: TargetProps) {
  return (
    <div {...target} className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      <HarnessTriggers />
      <HarnessHub />
      <HarnessOutcomes />
    </div>
  );
}
