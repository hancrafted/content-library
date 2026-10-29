import { cn } from '@/shared/lib/utils';
import { Fragment } from 'react';
import { Icon } from './route-chain-icon';
import { PIECES, stateOf, type Piece, type PieceState, type RouteChainProps } from './route-chain.pure';

/** A hero card's border and its icon tile, by state; the AI agent keeps its `ai` edge whatever its state. */
const HERO_LOOK: Readonly<Record<PieceState, { card: string; icon: string }>> = {
  done: { card: 'border border-primary', icon: 'bg-primary text-primary-foreground' },
  current: { card: 'border-2 border-primary', icon: 'bg-primary text-primary-foreground' },
  rest: { card: 'border border-border', icon: 'bg-muted text-foreground' },
};

/** The two-link mark between two hero cards: the next piece hooked onto this one. */
function HeroLink() {
  return (
    <li className="hidden w-10 shrink-0 items-center md:flex" aria-hidden="true">
      <svg viewBox="0 0 48 24" className="h-6 w-10" aria-hidden="true">
        <rect x="2" y="7" width="26" height="10" rx="5" className="fill-none stroke-border" strokeWidth="2.5" />
        <rect
          x="20"
          y="7"
          width="26"
          height="10"
          rx="5"
          className="fill-none stroke-muted-foreground"
          strokeWidth="2.5"
        />
      </svg>
    </li>
  );
}

function HeroBadge({ index, start }: { index: number; start: string | undefined }) {
  if (index === 0 && start !== undefined) {
    return (
      <span className="rounded-full bg-primary px-2.5 py-0.5 text-caption font-semibold whitespace-nowrap text-primary-foreground">
        {start}
      </span>
    );
  }
  return <span className="text-caption text-muted-foreground">{index + 1}</span>;
}

/** A hero card's look; the AI agent keeps its `ai` edge whatever its state. */
function heroLook(piece: Piece, state: PieceState): { card: string; icon: string } {
  const look = HERO_LOOK[state];
  if (piece !== 'agent') return look;
  const card = state === 'rest' ? 'border border-ai/40' : look.card;
  return { card: cn(card, 'ring-4 ring-ai/15'), icon: state === 'rest' ? 'bg-muted text-ai' : look.icon };
}

interface HeroPieceProps {
  readonly piece: Piece;
  readonly state: PieceState;
  readonly words: RouteChainProps['pieces'][Piece];
  readonly start: string | undefined;
}

function HeroPiece({ piece, state, words, start }: HeroPieceProps) {
  const look = heroLook(piece, state);
  return (
    <li
      data-piece={piece}
      data-state={state}
      className={cn(
        'focus-group__item card-hover card-hover--raise flex min-w-0 flex-1 basis-0 flex-col gap-5 rounded-2xl bg-card p-5',
        look.card,
      )}
    >
      <span className="flex flex-wrap items-start justify-between gap-2">
        <span className={cn('flex size-12 items-center justify-center rounded-xl', look.icon)}>
          <Icon of={piece} className="size-7" />
        </span>
        <HeroBadge index={PIECES.indexOf(piece)} start={start} />
      </span>
      <span>
        <span className="block text-body font-semibold">{words.title}</span>
        {words.sub && <span className="mt-1 block text-caption text-muted-foreground">{words.sub}</span>}
      </span>
    </li>
  );
}

function HeroProof({ proof }: Pick<RouteChainProps, 'proof'>) {
  return (
    <li className="focus-group__item card-hover card-hover--raise flex shrink-0 flex-col gap-3 rounded-2xl border border-dashed border-primary bg-background p-4 md:w-1/5">
      <span className="truncate rounded-lg border border-border bg-card px-2 py-1 font-mono text-caption text-muted-foreground">
        {proof.site}
      </span>
      <span className="flex flex-col gap-1.5 rounded-lg bg-muted p-3">
        <span className="text-body font-semibold">{proof.name}</span>
        <span className="h-1.5 w-3/4 rounded-full bg-border" />
        <span className="h-1.5 w-1/2 rounded-full bg-border" />
      </span>
      <span className="text-caption font-semibold text-primary">{proof.title}</span>
    </li>
  );
}

/** The dashed arrow from the last piece to the proof. */
function ProofArrow() {
  return (
    <li className="hidden w-10 shrink-0 items-center md:flex" aria-hidden="true">
      <svg viewBox="0 0 40 24" className="h-6 w-10" aria-hidden="true">
        <path
          d="M2 12 H30 M24 6 L32 12 L24 18"
          className="fill-none stroke-primary"
          strokeWidth="2.5"
          strokeDasharray="4 4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </li>
  );
}

/** The Title slide's chain: four cards linked in a row, then the proof; stacked below `md`. */
export function HeroChain({ label, pieces, proof, start, ...progress }: RouteChainProps) {
  return (
    <ol
      className="focus-group focus-group--dim-others flex flex-col gap-3 md:flex-row md:items-stretch md:gap-0"
      aria-label={label}
    >
      {PIECES.map((piece, index) => (
        <Fragment key={piece}>
          {index > 0 && <HeroLink />}
          <HeroPiece piece={piece} state={stateOf(piece, progress)} words={pieces[piece]} start={start} />
        </Fragment>
      ))}
      <ProofArrow />
      <HeroProof proof={proof} />
    </ol>
  );
}
