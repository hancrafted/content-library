import { cn } from '@/lib/utils';

/** One step of the climb: its rank is a relative height, not data, and the axis says so. */
export interface StaircaseStep {
  readonly label: string;
  readonly rank: 1 | 2 | 3 | 4;
  /** `machine`: a revolution whose machine took over the lower work; `ai`: the tallest step, the one to look at. */
  readonly tone: 'machine' | 'ai';
  readonly note?: string;
}

/** Each rank's tread height: relative ranks, laid out in HTML so every word keeps its type role. */
const RANK_HEIGHT = { 1: 'min-h-12', 2: 'min-h-24', 3: 'min-h-36', 4: 'min-h-64' } as const;

/** The dashed climb from the step the figure stands on towards the next one, and its arrowhead: decoration, no text. */
function Climb() {
  return (
    <svg viewBox="0 0 60 70" className="w-full" aria-hidden="true">
      <path
        d="M20 66C24 40 36 20 56 6"
        className="fill-none stroke-primary"
        strokeWidth="3"
        strokeDasharray="7 6"
        strokeLinecap="round"
      />
      <path
        d="M44 5H57L54 18"
        className="fill-none stroke-primary"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The person standing on a step: decoration, no text. */
function Figure() {
  return (
    <svg viewBox="0 0 40 36" className="mx-auto w-8" aria-hidden="true">
      <circle cx="20" cy="9" r="7" className="fill-human" />
      <path d="M8 36C8 20 32 20 32 36Z" className="fill-human" />
    </svg>
  );
}

function MachineStep({ step }: { step: StaircaseStep }) {
  return (
    <div className={cn('flex flex-col border border-foreground/25 bg-card', RANK_HEIGHT[step.rank])}>
      <span className="h-2 bg-machine/40" />
      <p className="px-1 py-2 text-center text-caption font-semibold">{step.label}</p>
    </div>
  );
}

function AiStep({ step, goal }: { step: StaircaseStep; goal: string }) {
  return (
    <div className="col-span-2 flex flex-col gap-3">
      <p className="rounded-full bg-primary px-3 py-1.5 text-center text-caption font-semibold text-primary-foreground shadow-md">
        {goal}
      </p>
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-1 border border-primary bg-ai/15 p-3 text-center shadow-md',
          RANK_HEIGHT[step.rank],
        )}
      >
        <p className="text-body font-semibold text-ai">{step.label}</p>
        {step.note ? <p className="text-caption text-muted-foreground">{step.note}</p> : null}
      </div>
    </div>
  );
}

/** One column of the row: the AI step under its goal pill, the step the figure stands on, or a plain step. */
function StepColumn({ step, standing, goal }: { step: StaircaseStep; standing: boolean; goal: string }) {
  if (step.tone === 'ai') return <AiStep step={step} goal={goal} />;
  if (!standing) return <MachineStep step={step} />;
  return (
    <div className="flex flex-col">
      <Climb />
      <Figure />
      <MachineStep step={step} />
    </div>
  );
}

/**
 * The Hero motif: a wall relief of steps, one per revolution, each as high as how complex a task one person takes
 * on, with the person standing on `standOn` facing the tallest step, AI, under its `goal` pill. One `role="img"`
 * row on an axis; only the figure and the dashed climb are SVG, and they carry no text.
 */
export function Staircase(props: {
  steps: readonly StaircaseStep[];
  standOn: number;
  goal: string;
  axis: string;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-caption text-muted-foreground">
        <span aria-hidden="true">↑ </span>
        {props.axis}
      </p>
      <div
        role="img"
        aria-label={props.label}
        className="grid grid-cols-5 items-end gap-2 border-b-2 border-l-2 border-muted-foreground pl-2"
      >
        {props.steps.map((step, index) => (
          <StepColumn key={step.label} step={step} standing={index === props.standOn} goal={props.goal} />
        ))}
      </div>
    </div>
  );
}
