import { localizePath, type Locale } from '@/shared/lib/locale.pure';
import { ExternalLink } from 'lucide-react';
import { DoneStrip } from '../guide-step/guide-step';

export interface HandsOnWorkflowLink {
  readonly path: string;
  readonly fragment?: string;
  readonly locale: Locale;
  readonly label: string;
  readonly pick: string;
  readonly newTab: string;
}

export interface HandsOnStepProps {
  readonly stage: string;
  readonly timebox: string;
  readonly steps: readonly string[];
  readonly workflow: HandsOnWorkflowLink;
  readonly done: { readonly label: string; readonly text: string };
}

function StepsCard({ stage, timebox, steps, done }: Omit<HandsOnStepProps, 'workflow'>) {
  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-8 shadow-md md:col-span-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-caption font-semibold tracking-widest text-(--info) uppercase">{stage}</p>
        <p className="rounded-full bg-muted px-3 py-1 text-caption font-semibold tabular-nums">{timebox}</p>
      </div>
      <ol className="flex flex-col gap-3">
        {steps.map((step, index) => (
          <li key={step} className="flex items-start gap-4">
            <span className="flex size-8 flex-none items-center justify-center rounded-full bg-(--info) text-body font-semibold text-info-foreground">
              {index + 1}
            </span>
            <p className="pt-0.5 text-body">{step}</p>
          </li>
        ))}
      </ol>
      <DoneStrip label={done.label}>{done.text}</DoneStrip>
    </div>
  );
}

function WorkflowCard({ workflow }: { readonly workflow: HandsOnWorkflowLink }) {
  return (
    <div className="flex flex-col justify-center gap-4 rounded-xl bg-primary p-8 text-primary-foreground shadow-md md:col-span-4">
      <a
        href={localizePath(workflow.path, workflow.locale, workflow.fragment)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-fit items-center gap-2 rounded-lg bg-background px-4 py-3 text-body font-semibold text-foreground"
      >
        {workflow.label}
        <ExternalLink aria-hidden="true" className="size-4" />
        <span className="sr-only">({workflow.newTab})</span>
      </a>
      <p className="text-body opacity-90">{workflow.pick}</p>
    </div>
  );
}

export function HandsOnStep({ workflow, ...steps }: HandsOnStepProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
      <StepsCard {...steps} />
      <WorkflowCard workflow={workflow} />
    </div>
  );
}
