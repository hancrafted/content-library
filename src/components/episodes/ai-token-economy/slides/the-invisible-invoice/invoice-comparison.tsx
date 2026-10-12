import type { ReactElement } from 'react';

function FreelancerInvoiceCard(): ReactElement {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">Invoice #0042</span>
        <span className="inline-flex items-center rounded-full px-2 py-0.5 bg-(--success)/10 text-(--success) font-mono text-xs">
          approved
        </span>
      </div>
      <div className="mt-4 space-y-2 text-sm text-foreground">
        <div className="flex justify-between">
          <span>Slide design</span>
          <span className="font-mono">€1,800</span>
        </div>
        <div className="flex justify-between">
          <span>Alignment</span>
          <span className="font-mono">€900</span>
        </div>
        <div className="flex justify-between">
          <span>Revisions</span>
          <span className="font-mono">€500</span>
        </div>
      </div>
      <div className="mt-4 flex justify-between border-t border-border pt-3">
        <span className="font-bold">Total</span>
        <span className="font-mono text-xl font-bold">€3,200</span>
      </div>
    </div>
  );
}

const AI_INCREMENTS = ['+€0.80', '+€1.20', '+€0.60', '+€2.10', '+€0.90', '+ thousands more…'] as const;

function AiInvoiceCard(): ReactElement {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">AI · No Invoice</span>
        <span className="inline-flex items-center rounded-full px-2 py-0.5 bg-muted text-muted-foreground font-mono text-xs">
          never quoted
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
        {AI_INCREMENTS.map((item) => (
          <span key={item} className="rounded-md bg-card px-2 py-1 font-mono">
            {item}
          </span>
        ))}
      </div>
      <div className="mt-8 flex justify-between border-t border-border pt-3">
        <span className="font-bold text-muted-foreground">Cumulative Total</span>
        <span className="font-mono text-xl font-bold text-primary">€3,200</span>
      </div>
    </div>
  );
}

export function InvoiceComparison(): ReactElement {
  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      <FreelancerInvoiceCard />
      <AiInvoiceCard />
    </div>
  );
}
