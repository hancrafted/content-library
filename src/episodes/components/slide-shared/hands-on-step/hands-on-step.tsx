import { localizePath, type Locale } from '@/shared/lib/locale.pure';
import { ExternalLink } from 'lucide-react';
import { DoneStrip } from '../guide-step/guide-step';

/** Where a hands-on step's instructions live: a page the viewer opens, and the Workflow to pick there. */
export interface HandsOnWorkflowLink {
  /** The locale-neutral path of the page holding the Workflow: `/explorables/human-in-the-loop`. */
  readonly path: string;
  readonly locale: Locale;
  /** The link's own words: "Open the quiz Workflow". */
  readonly label: string;
  /** What to pick on that page: "Pick “Turn a source into a quiz”, then …". */
  readonly pick: string;
  /** The screen-reader hint that the link opens a new tab. */
  readonly newTab: string;
}

export interface HandsOnStepProps {
  /** The kicker above the steps: "Stage 1 · Requirements". */
  readonly stage: string;
  /** The time box: "20 minutes". */
  readonly timebox: string;
  /** What to do, in order, one plain sentence each. */
  readonly steps: readonly string[];
  readonly workflow: HandsOnWorkflowLink;
  /** What done looks like: its label and the result. */
  readonly done: { readonly label: string; readonly text: string };
}

/** The steps card: the stage and its time box, the steps in order, and what done looks like. */
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

/** The way to the Workflow: a link opening the page in a new tab, and what to pick there. */
function WorkflowCard({ workflow }: { readonly workflow: HandsOnWorkflowLink }) {
  return (
    <div className="flex flex-col justify-center gap-4 rounded-xl bg-primary p-8 text-primary-foreground shadow-md md:col-span-4">
      <a
        href={localizePath(workflow.path, workflow.locale)}
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

/**
 * One hands-on step of a workshop: the stage and its time box, the steps in order, what done looks like, and beside
 * them the way to the Workflow that holds the full instructions. The Slide only points; the Workflow teaches.
 */
export function HandsOnStep({ workflow, ...steps }: HandsOnStepProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
      <StepsCard {...steps} />
      <WorkflowCard workflow={workflow} />
    </div>
  );
}
