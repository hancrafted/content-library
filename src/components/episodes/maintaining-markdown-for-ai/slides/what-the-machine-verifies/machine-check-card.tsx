import type { TargetProps } from '@/lib/context-link.pure';

function MachineCheckList() {
  return (
    <div className="mt-4 space-y-3 font-mono text-xs text-foreground/90">
      <div className="flex items-start gap-2">
        <span className="text-primary font-bold">✓</span>
        <span>Syntax: valid YAML frontmatter delimiter (---) &amp; structure</span>
      </div>
      <div className="flex items-start gap-2">
        <span className="text-primary font-bold">✓</span>
        <span>Resource: present and well-formed URI (https://intranet.example.com/people-ops/handbook#onboarding)</span>
      </div>
      <div className="flex items-start gap-2">
        <span className="text-primary font-bold">✓</span>
        <span>Staleness: 2026-07-01T00:00:00Z parses with valid ISO timestamp</span>
      </div>
    </div>
  );
}

export function MachineCheckCard(target: TargetProps) {
  return (
    <div {...target} className="mt-8 rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-primary/20 pb-4">
        <span className="font-mono text-sm font-bold text-primary">Machine check</span>
        <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-primary">
          Resolves cleanly
        </span>
      </div>
      <MachineCheckList />
      <p className="mt-6 border-t border-primary/20 pt-4 text-xs text-muted-foreground">
        Machine checking proves the file is mechanically sound. It cannot determine if the policy is still active.
      </p>
    </div>
  );
}
