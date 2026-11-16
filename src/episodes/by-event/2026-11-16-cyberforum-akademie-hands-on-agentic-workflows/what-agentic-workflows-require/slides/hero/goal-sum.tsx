import { Cross, DoneBy, Tick } from '@/episodes/components/slide-shared/seam-sum/marks';
import { cn } from '@/shared/lib/utils';

interface GoalSumProps {
  /** The Scene's accessible name: four ticked cards that do not add up to the goal. */
  readonly label: string;
  readonly cards: readonly { readonly number: number; readonly doneBy: string; readonly done: string }[];
  /** The only word on the visual. */
  readonly goal: string;
  readonly broken: string;
}

function Sign({ children }: { children: string }) {
  return (
    <span aria-hidden className="text-heading font-semibold text-muted-foreground">
      {children}
    </span>
  );
}

/** A ticked card: who did it, the tick, its number. Nothing to read. */
function TickedCard({ number, doneBy, done, tilt }: { number: number; doneBy: string; done: string; tilt: string }) {
  return (
    <div
      data-ticked-card
      className={cn(
        'flex size-24 shrink-0 sm:size-28 flex-col items-center justify-between rounded-sm bg-card p-3 shadow-md',
        tilt,
      )}
    >
      <span className="self-start">
        <DoneBy who="person" label={doneBy} />
      </span>
      <span className="scale-[2.5]">
        <Tick label={done} />
      </span>
      <span data-card-number className="text-caption font-semibold text-muted-foreground">
        {number}
      </span>
    </div>
  );
}

/** The crack through the goal card. */
function Crack() {
  return (
    <svg viewBox="0 0 60 80" aria-hidden preserveAspectRatio="xMidYMid meet" className="absolute inset-0 size-full p-2">
      <path
        d="M30 2l-8 16 14 10-12 14 12 12-10 20"
        className="fill-none stroke-destructive"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The goal, broken: a card with a crack through it and the failure cross on its corner. */
function BrokenGoal({ goal, broken }: Pick<GoalSumProps, 'goal' | 'broken'>) {
  return (
    <div
      data-broken-goal
      className="relative flex size-24 shrink-0 sm:size-28 rotate-1 flex-col items-center justify-center rounded-sm border-2 border-destructive bg-card p-3 shadow-xl"
    >
      <Cross label={broken} />
      <Crack />
      <span data-goal-label className="relative rounded-sm bg-card px-1 text-body font-semibold uppercase">
        {goal}
      </span>
    </div>
  );
}

/**
 * The Title slide's picture (Spec Option B, plain numbered cards): four ticked cards add up to a goal that is
 * broken. Abstract on purpose: no party, no names, and "Goal" is the only word on it.
 */
export function GoalSum({ label, cards, goal, broken }: GoalSumProps) {
  return (
    <div
      data-goal-sum
      role="img"
      aria-label={label}
      className="flex flex-wrap items-center justify-center gap-3 rounded-xl bg-muted p-6 shadow-inner md:gap-5 md:p-8"
    >
      {cards.flatMap(({ number, doneBy, done }, index) => [
        index > 0 ? <Sign key={`plus-${number}`}>+</Sign> : null,
        <TickedCard
          key={number}
          number={number}
          doneBy={doneBy}
          done={done}
          tilt={index % 2 === 0 ? '-rotate-1' : 'rotate-1'}
        />,
      ])}
      <Sign>=</Sign>
      <BrokenGoal goal={goal} broken={broken} />
    </div>
  );
}
