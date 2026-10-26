import type { TargetProps } from '@/lib/context-link.pure';

function SettledWorkflowPasses() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-xs">
        <span className="font-mono text-muted-foreground">Machine check</span>
        <span className="text-muted-foreground">✓ Resolved cleanly</span>
      </div>
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-xs">
        <span className="font-mono text-muted-foreground">AI recommendation</span>
        <span className="text-muted-foreground">⚠ Discrepancy flagged</span>
      </div>
    </div>
  );
}

function HumanJudgmentQuestions() {
  return (
    <div className="mt-4 space-y-3 font-mono text-xs text-foreground/90">
      <div className="flex items-start gap-2">
        <span className="text-human font-bold">?</span>
        <span>Does the buddy coffee on day one still match team practice?</span>
      </div>
      <div className="flex items-start gap-2">
        <span className="text-human font-bold">?</span>
        <span>Does People Ops still close provisional accounts on Friday 5pm?</span>
      </div>
      <div className="flex items-start gap-2">
        <span className="text-human font-bold">?</span>
        <span>Is the stated owner (@people-ops) still the accountable team?</span>
      </div>
    </div>
  );
}

export function HumanJudgmentCard(target: TargetProps) {
  return (
    <div className="mt-8 space-y-4">
      <SettledWorkflowPasses />
      <div {...target} className="rounded-2xl border border-human/40 bg-human/5 p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-human/20 pb-4">
          <span className="font-mono text-sm font-bold text-human">Human judgment</span>
          <span className="deck-unsettled rounded-full border border-human/40 bg-human/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-human">
            Open · Unresolved
          </span>
        </div>
        <HumanJudgmentQuestions />
        <p className="mt-6 border-t border-human/20 pt-4 text-xs text-muted-foreground">
          Ground truth that no machine or language model can know. You are the one accountable when it is wrong.
        </p>
      </div>
    </div>
  );
}
