import type { ReactNode } from 'react';

const LOOP = (
  <svg viewBox="0 0 24 24" className="size-3.5 shrink-0" aria-hidden="true">
    <path
      d="M21 12a9 9 0 1 1-2.6-6.4M21 3v6h-6"
      className="fill-none stroke-current"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** The steps the agent loops through, in `ai`, until it thinks it is done. */
function Steps({ steps, done }: { readonly steps: readonly string[]; readonly done: string }) {
  return (
    <ol className="flex flex-wrap items-center gap-2">
      {steps.map((step, index) => (
        <li key={step} className="flex items-center gap-2">
          {index > 0 && (
            <span aria-hidden="true" className="text-caption text-muted-foreground">
              →
            </span>
          )}
          <span
            data-steers-step=""
            className="rounded-md border border-ai/50 bg-card px-2 py-1 text-caption text-foreground"
          >
            {step}
          </span>
        </li>
      ))}
      <li className="inline-flex items-center gap-1 text-caption font-semibold text-foreground">
        {LOOP}
        {done}
      </li>
    </ol>
  );
}

/** Dashed zoom lines from the Research column down to the lens, where the stages sit side by side. */
const ZOOM = (
  <svg
    viewBox="0 0 300 50"
    preserveAspectRatio="none"
    className="col-span-4 col-start-6 hidden h-10 w-full @2xl:block"
    aria-hidden="true"
  >
    <path
      d="M150 0 L10 50 M230 0 L290 50"
      className="fill-none stroke-foreground"
      strokeWidth={1.5}
      strokeDasharray="6 5"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

/** The lens's head: who loops, the agent dot in `ai`, and the Context marker. */
function LensHead({
  label,
  agent,
  marker,
}: {
  readonly label: string;
  readonly agent: string;
  readonly marker: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span
        data-steers-label=""
        className="rounded-full border-2 border-foreground px-4 py-1 text-body font-semibold text-foreground"
      >
        {label}
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-ai/15 px-2 py-0.5 text-caption font-semibold text-foreground">
        <span className="size-2 rounded-full bg-ai" aria-hidden="true" />
        {agent}
      </span>
      {marker}
    </div>
  );
}

/**
 * The second level, zoomed out of the Research rounds: the task you set the agent, then the steps it loops through,
 * looping until it thinks it is done.
 */
export function SteersLens(props: {
  readonly label: string;
  readonly agent: string;
  readonly task: string;
  readonly steps: readonly string[];
  readonly done: string;
  readonly marker: ReactNode;
}) {
  return (
    <div data-steers-lens="" className="grid grid-cols-12 gap-x-4">
      {ZOOM}
      <div className="col-span-12 flex flex-col gap-3 rounded-2xl border-2 border-dashed border-foreground bg-card p-5 shadow-md @2xl:col-span-7 @2xl:col-start-5">
        <LensHead label={props.label} agent={props.agent} marker={props.marker} />
        <p data-steers-task="" className="text-caption text-muted-foreground">
          {props.task}
        </p>
        <Steps steps={props.steps} done={props.done} />
      </div>
    </div>
  );
}
