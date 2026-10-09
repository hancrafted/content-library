export function LiveDemoCard({ 'data-target': dataTarget }: { 'data-target'?: string }) {
  return (
    <div data-target={dataTarget} className="mt-8 max-w-3xl space-y-6">
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          File under test
        </p>
        <p className="mt-2 font-mono text-xl font-bold text-foreground">docs/handbook/onboarding.md</p>
      </div>

      <div className="rounded-xl border-l-4 border-primary bg-primary/5 p-5 shadow-xs">
        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Asked of the agent
        </p>
        <p className="mt-2 text-lg text-foreground italic">
          “What are the first-week onboarding steps for a new hire?”
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground">
        <p className="font-mono font-semibold text-foreground">Comparative contrast in terminal</p>
        <p className="mt-1">
          Unhooked panel answers confidently from stale documentation. Hooked panels either warn the agent with steering
          instructions or deny access entirely.
        </p>
      </div>
    </div>
  );
}
