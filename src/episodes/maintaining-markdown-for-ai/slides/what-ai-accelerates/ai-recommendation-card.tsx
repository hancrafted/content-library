import type { TargetProps } from '@/shared/lib/context-link.pure';

function AiDiscrepancyBody() {
  return (
    <div className="mt-4 space-y-4 text-xs">
      <div>
        <p className="font-mono font-semibold uppercase tracking-wider text-muted-foreground">Observation</p>
        <p className="mt-1 text-muted-foreground">
          Compared <code className="text-foreground">onboarding.md</code> against linked People Ops handbook. Section 4
          of the handbook updated equipment lead times from 5 working days to 7 working days.
        </p>
      </div>
      <div>
        <p className="font-mono font-semibold uppercase tracking-wider text-muted-foreground">Proposal</p>
        <p className="mt-1 text-muted-foreground">Recommend updating line 15 and notifying the hiring manager.</p>
      </div>
    </div>
  );
}

export function AiRecommendationCard(target: TargetProps) {
  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4 text-xs">
        <span className="font-mono font-medium text-muted-foreground">Machine check</span>
        <span className="text-muted-foreground">✓ Resolved cleanly</span>
      </div>
      <div {...target} className="rounded-2xl border border-ai/40 bg-ai/5 p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-ai/20 pb-4">
          <span className="font-mono text-sm font-bold text-ai">AI recommendation</span>
          <span className="rounded-full border border-ai/40 bg-ai/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-ai">
            ⚠ Discrepancy flagged (needs check)
          </span>
        </div>
        <AiDiscrepancyBody />
        <p className="mt-6 border-t border-ai/20 pt-4 text-xs text-muted-foreground">
          The recommendation is rapid and insightful, but remains an unverified claim itself.
        </p>
      </div>
    </div>
  );
}
