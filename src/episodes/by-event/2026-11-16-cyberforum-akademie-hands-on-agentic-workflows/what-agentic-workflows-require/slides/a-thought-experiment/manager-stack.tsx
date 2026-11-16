import { CardHeader } from '@/episodes/components/slide-shared/seam-sum/card-header';
import { tiltOf } from '@/episodes/components/slide-shared/seam-sum/tilt.pure';
import { cn } from '@/shared/lib/utils';

export interface Freelancer {
  readonly slug: string;
  readonly label: string;
}

export interface PriceTrait {
  readonly slug: string;
  readonly initial: string;
  readonly name: string;
  /** The German word beside the English name, as the pay-the-price slide sets it; empty where there is none. */
  readonly gloss: string;
}

interface ManagerStackProps {
  readonly task: { readonly label: string; readonly text: string };
  readonly freelancers: { readonly label: string; readonly cards: readonly Freelancer[] };
  /** The five traits: their letters sit on every card, their names once in the legend. */
  readonly price: { readonly label: string; readonly traits: readonly PriceTrait[] };
  readonly rule: string;
  readonly goal: { readonly label: string; readonly text: string };
  readonly manager: { readonly label: string; readonly question: string };
}

/** The five PRICE letters of one freelancer, named for assistive technology. */
function PriceChips({ price }: Pick<ManagerStackProps, 'price'>) {
  return (
    <ul aria-label={price.label} className="flex gap-1">
      {price.traits.map((trait) => (
        <li
          key={trait.slug}
          data-price-chip={trait.slug}
          title={trait.name}
          className="flex size-7 items-center justify-center rounded-sm border border-border bg-muted text-caption font-semibold"
        >
          <span aria-hidden>{trait.initial}</span>
          <span className="sr-only">{trait.name}</span>
        </li>
      ))}
    </ul>
  );
}

/** One line of the stack: a small caps label, then its text. */
function LabelledLine({ label, children, className }: { label: string; children: string; className?: string }) {
  return (
    <p className={cn('flex flex-wrap items-baseline gap-x-3 gap-y-1 text-body', className)}>
      <span className="text-caption font-medium tracking-wide text-muted-foreground uppercase">{label}</span>
      <span className="font-semibold">{children}</span>
    </p>
  );
}

/** One freelancer: the name pill and the five PRICE letters; nothing is done yet, so no badge. */
function FreelancerCard(props: { freelancer: Freelancer; index: number; price: ManagerStackProps['price'] }) {
  const { freelancer, index, price } = props;
  return (
    <li
      data-freelancer={freelancer.slug}
      className={cn('flex min-w-0 flex-col gap-3 rounded-sm bg-card p-3 shadow-md', tiltOf(index))}
    >
      <CardHeader label={freelancer.label} />
      <PriceChips price={price} />
    </li>
  );
}

/** The four freelancer cards and the PRICE legend beneath them, on the muted board. */
function Freelancers({ freelancers, price }: Pick<ManagerStackProps, 'freelancers' | 'price'>) {
  return (
    <section aria-label={freelancers.label} className="flex flex-col gap-4 rounded-2xl bg-muted p-5 shadow-inner">
      <ul className="grid grid-cols-1 gap-3 @xl:grid-cols-2 @4xl:grid-cols-4">
        {freelancers.cards.map((freelancer, index) => (
          <FreelancerCard key={freelancer.slug} freelancer={freelancer} index={index} price={price} />
        ))}
      </ul>
      <ul data-price-legend className="flex flex-wrap gap-x-5 gap-y-1 text-caption text-muted-foreground">
        {price.traits.map((trait) => (
          <li key={trait.slug}>
            <b className="text-foreground">{trait.initial}</b> {trait.name}
            {trait.gloss !== '' && <> {trait.gloss}</>}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The one dark band: the role named, then the question that waits for the room. */
function ManagerBand({ manager }: Pick<ManagerStackProps, 'manager'>) {
  return (
    <section
      data-manager
      className="flex flex-col gap-2 rounded-2xl bg-primary px-6 py-5 text-primary-foreground shadow-md @2xl:px-8"
    >
      <p className="text-caption font-medium tracking-wide uppercase">{manager.label}</p>
      <p data-question className="text-subheading font-semibold">
        {manager.question}
      </p>
    </section>
  );
}

/**
 * The manager's stack (Spec Option A): one tall stack like "You're the new hire". The task, four freelancers each
 * carrying the five PRICE letters with their names once beneath, the rule that they talk to no one, the goal, then
 * the one dark band where the role is named and the closing question waits for the room.
 */
export function ManagerStack({ task, freelancers, price, rule, goal, manager }: ManagerStackProps) {
  return (
    <div data-manager-stack className="@container flex flex-col gap-5">
      <LabelledLine label={task.label}>{task.text}</LabelledLine>
      <Freelancers freelancers={freelancers} price={price} />
      <p
        data-rule
        className="flex items-center gap-3 rounded-sm border-2 border-dashed border-destructive px-4 py-2 text-body font-medium text-destructive"
      >
        <span aria-hidden>✗</span>
        {rule}
      </p>
      <LabelledLine label={goal.label}>{goal.text}</LabelledLine>
      <ManagerBand manager={manager} />
    </div>
  );
}
