import type { ReactNode } from 'react';

/** The five PRICE traits, in letter order. */
export const TRAITS = ['probabilistic', 'relentless', 'informed', 'confident', 'every-word-billed'] as const;
type Trait = (typeof TRAITS)[number];

/** One trait's crack: its name, why it cracked the plan, and what it left in the documents. */
export interface Crack {
  slug: Trait;
  /** The letter on the chip: the acronym's, so German still spells PRICE. */
  initial: string;
  trait: string;
  /** The name in the viewer's language under an English name; empty where the name already is. */
  gloss: string;
  why: string;
  produced: string;
}

interface PromptToPlanProps {
  prompt: { label: string; text: string };
  stackLabel: string;
  traitsLabel: string;
  cracks: readonly Crack[];
  callout: ReactNode;
}

/** The four columns at width: the traits, right-aligned to their chips in the middle, the connectors, the pile. */
const COLUMNS = '@3xl:grid-cols-[minmax(0,1fr)_auto_4rem_minmax(0,1fr)]';

/** The pages with no mark of their own, scattered under the five marked ones. */
const LOOSE = [
  { top: '2%', left: '6%', turn: -6 },
  { top: '14%', left: '22%', turn: 4 },
  { top: '30%', left: '2%', turn: -3 },
  { top: '44%', left: '26%', turn: 7 },
  { top: '58%', left: '8%', turn: -8 },
  { top: '70%', left: '20%', turn: 3 },
  { top: '80%', left: '4%', turn: 5 },
] as const;

/** Each marked document's place in the pile: a small turn and shift, so the five read as thrown down, not filed. */
const SCATTER = [
  { turn: -2, shift: 0 },
  { turn: 1.5, shift: 14 },
  { turn: -1, shift: -4 },
  { turn: 2.5, shift: 20 },
  { turn: -1.5, shift: 6 },
] as const;

/** The trait's letter on a chip, the PRICE chip in miniature. */
function Letter({ initial }: { initial: string }) {
  return (
    <span
      data-trait-initial
      translate="no"
      aria-hidden="true"
      className="order-first grid size-10 shrink-0 place-items-center rounded-full bg-primary text-body font-semibold text-primary-foreground shadow-md @3xl:order-none"
    >
      {initial}
    </span>
  );
}

/** The prompt as a chat input over the traits and chips, an arrow out to the pile's label. */
function PromptRow({ prompt, stackLabel }: Pick<PromptToPlanProps, 'prompt' | 'stackLabel'>) {
  return (
    <div className={`grid items-center gap-3 @3xl:gap-0 ${COLUMNS}`}>
      <p className="flex flex-col gap-1 rounded-2xl border border-border bg-card px-5 py-3 shadow-sm @3xl:col-span-2">
        <span className="text-caption tracking-wide text-muted-foreground uppercase">{prompt.label}</span>
        <span className="text-body font-semibold">{prompt.text}</span>
      </p>
      <Connector />
      <p className="text-body font-semibold @3xl:pl-4">{stackLabel}</p>
    </div>
  );
}

/** A hairline from a chip out to its document, ending in an arrowhead. */
function Connector() {
  return (
    <svg viewBox="0 0 64 12" preserveAspectRatio="none" className="hidden h-3 w-full @3xl:block" aria-hidden="true">
      <path
        d="M4 6h54M54 2l4 4-4 4"
        className="fill-none stroke-muted-foreground"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** The seven unmarked documents, scattered behind the marked ones. */
function LoosePages() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 @3xl:block" aria-hidden="true">
      {LOOSE.map((page) => (
        <div
          key={`${page.top} ${page.left}`}
          className="absolute h-20 w-3/4 max-w-sm rounded-md border border-border bg-card shadow-sm"
          style={{ top: page.top, left: page.left, transform: `rotate(${page.turn}deg)` }}
        />
      ))}
    </div>
  );
}

/** One marked document: two ruled lines of filler, then what the trait left in it, underlined as a fault. */
function Page({ produced, place }: { produced: string; place: (typeof SCATTER)[number] }) {
  return (
    <p
      className="relative flex w-full max-w-sm flex-col gap-1.5 rounded-md border border-border bg-card px-4 py-3 text-body shadow-md @3xl:-my-2"
      style={{ transform: `translateX(${place.shift}px) rotate(${place.turn}deg)` }}
    >
      <span aria-hidden="true" className="h-1 w-3/4 rounded-full bg-muted" />
      <span className="underline decoration-destructive/50 decoration-wavy underline-offset-4">{produced}</span>
    </p>
  );
}

/** One trait's row: its name and why, right-aligned to its chip; the connector; the document it marked. */
function CrackRow({ crack, place }: { crack: Crack; place: (typeof SCATTER)[number] }) {
  return (
    <li className="focus-group__item flex flex-wrap items-center gap-3 @3xl:col-span-4 @3xl:grid @3xl:grid-cols-subgrid @3xl:gap-0">
      <p className="flex flex-1 flex-col @3xl:pr-4 @3xl:text-right">
        <span translate="no" className="text-body font-semibold">
          {crack.trait}
        </span>
        {crack.gloss === '' ? null : (
          <span data-trait-gloss className="text-caption text-muted-foreground">
            {crack.gloss}
          </span>
        )}
        <span className="text-body text-muted-foreground">{crack.why}</span>
      </p>
      <Letter initial={crack.initial} />
      <Connector />
      <div className="w-full @3xl:pl-4">
        <Page produced={crack.produced} place={place} />
      </div>
    </li>
  );
}

/** What the pile costs you, across the whole Scene. */
function Callout({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center justify-center gap-3 rounded-2xl border border-destructive/40 bg-destructive/5 px-6 py-4 text-body">
      <svg viewBox="0 0 24 24" className="size-6 shrink-0" aria-hidden="true">
        <path
          d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3"
          className="fill-none stroke-destructive"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{children}</span>
    </p>
  );
}

/**
 * One prompt, one polished plan: the prompt on top with an arrow out to twelve documents. Down the middle the five
 * PRICE chips in letter order, each trait's name and why right-aligned beside it, and a hairline out to the document
 * it marked in a scattered pile; the mark is a wavy underline beside its row, so it never rests on colour alone.
 * Pointing at a row dims the others. The callout closes it across the whole Scene.
 */
export function PromptToPlan({ prompt, stackLabel, traitsLabel, cracks, callout }: PromptToPlanProps) {
  return (
    <div className="@container flex flex-col gap-8">
      <PromptRow prompt={prompt} stackLabel={stackLabel} />
      <div className="relative">
        <LoosePages />
        <ol aria-label={traitsLabel} className={`focus-group focus-group--dim-others relative grid gap-5 ${COLUMNS}`}>
          {cracks.map((crack, index) => (
            <CrackRow key={crack.slug} crack={crack} place={SCATTER[index] ?? SCATTER[0]} />
          ))}
        </ol>
      </div>
      <Callout>{callout}</Callout>
    </div>
  );
}
