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

export function MachineCheckCard({ id }: { id?: string }) {
  return (
    <div id={id} className="mt-8 rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-xs">
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

export function AiRecommendationCard({ id }: { id?: string }) {
  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4 text-xs">
        <span className="font-mono font-medium text-muted-foreground">Machine check</span>
        <span className="text-muted-foreground">✓ Resolved cleanly</span>
      </div>
      <div id={id} className="rounded-2xl border border-accent/40 bg-accent/5 p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-accent/20 pb-4">
          <span className="font-mono text-sm font-bold text-accent">AI recommendation</span>
          <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-accent">
            ⚠ Discrepancy flagged (needs check)
          </span>
        </div>
        <AiDiscrepancyBody />
        <p className="mt-6 border-t border-accent/20 pt-4 text-xs text-muted-foreground">
          The recommendation is rapid and insightful, but remains an unverified claim itself.
        </p>
      </div>
    </div>
  );
}

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
        <span className="text-secondary font-bold">?</span>
        <span>Does the buddy coffee on day one still match team practice?</span>
      </div>
      <div className="flex items-start gap-2">
        <span className="text-secondary font-bold">?</span>
        <span>Does People Ops still close provisional accounts on Friday 5pm?</span>
      </div>
      <div className="flex items-start gap-2">
        <span className="text-secondary font-bold">?</span>
        <span>Is the stated owner (@people-ops) still the accountable team?</span>
      </div>
    </div>
  );
}

export function HumanJudgmentCard({ id }: { id?: string }) {
  return (
    <div className="mt-8 space-y-4">
      <SettledWorkflowPasses />
      <div id={id} className="rounded-2xl border border-secondary/40 bg-secondary/5 p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-secondary/20 pb-4">
          <span className="font-mono text-sm font-bold text-secondary">Human judgment</span>
          <span className="deck-unsettled rounded-full border border-secondary/40 bg-secondary/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-secondary">
            Open · Unresolved
          </span>
        </div>
        <HumanJudgmentQuestions />
        <p className="mt-6 border-t border-secondary/20 pt-4 text-xs text-muted-foreground">
          Ground truth that no machine or language model can know. You are the one accountable when it is wrong.
        </p>
      </div>
    </div>
  );
}
