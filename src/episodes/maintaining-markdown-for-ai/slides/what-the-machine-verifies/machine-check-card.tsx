import type { TargetProps } from '@/shared/lib/context-link.pure';

function MachineCheckList() {
  return (
    <div className="mt-4 space-y-3 font-mono text-xs text-foreground/90">
      <div className="flex items-start gap-2">
        <span className="text-machine font-bold">✓</span>
        <span>Syntax: valid YAML frontmatter delimiter (---) &amp; structure</span>
      </div>
      <div className="flex items-start gap-2">
        <span className="text-machine font-bold">✓</span>
        <span>Resource: present and well-formed URI (https://intranet.example.com/people-ops/handbook#onboarding)</span>
      </div>
      <div className="flex items-start gap-2">
        <span className="text-machine font-bold">✓</span>
        <span>Staleness: 2026-07-01T00:00:00Z parses with valid ISO timestamp</span>
      </div>
    </div>
  );
}

export function MachineCheckCard(target: TargetProps) {
  return (
    <div {...target} className="mt-8 rounded-2xl border border-machine/30 bg-machine/5 p-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-machine/20 pb-4">
        <span className="font-mono text-sm font-bold text-machine">Machine check</span>
        <span className="rounded-full border border-machine/40 bg-machine/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-machine">
          Resolves cleanly
        </span>
      </div>
      <MachineCheckList />
      <p className="mt-6 border-t border-machine/20 pt-4 text-xs text-muted-foreground">
        Machine checking proves the file is mechanically sound. It cannot determine if the policy is still active.
      </p>
    </div>
  );
}
