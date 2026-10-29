import { cn } from '@/shared/lib/utils';
import { Fragment } from 'react';
import { HeroChain } from './route-chain-hero';
import { Icon } from './route-chain-icon';
import { PIECES, stateOf, type Piece, type PieceState, type RouteChainProps } from './route-chain.pure';

export type { RouteChainProps } from './route-chain.pure';

/** A mini piece's look: finished filled, current outlined (dashed by hand), the rest hairline; the AI agent ringed in `ai`. */
const MINI_LOOK: Readonly<Record<PieceState, string>> = {
  done: 'bg-primary text-primary-foreground',
  current: 'border-2 border-primary bg-card text-primary',
  rest: 'border border-border bg-card text-muted-foreground',
};

function MiniPiece(props: { piece: Piece; state: PieceState; title: string; byHand: boolean | undefined }) {
  const { piece, state, title, byHand } = props;
  return (
    <li
      data-piece={piece}
      data-state={state}
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-lg',
        MINI_LOOK[state],
        state === 'current' && byHand && 'border-dashed',
        piece === 'agent' && 'ring-2 ring-ai/25',
      )}
      aria-label={title}
    >
      <Icon of={piece} className="size-5" />
    </li>
  );
}

function MiniChain({ label, pieces, proof, byHand, ...progress }: RouteChainProps) {
  return (
    <ol className="flex items-center gap-1" aria-label={label}>
      {PIECES.map((piece) => (
        <Fragment key={piece}>
          <MiniPiece piece={piece} state={stateOf(piece, progress)} title={pieces[piece].title} byHand={byHand} />
          <li className="h-0.5 flex-1 bg-border" aria-hidden="true" />
        </Fragment>
      ))}
      <li
        className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground"
        aria-label={proof.title}
      >
        <Icon of="proof" className="size-5" />
      </li>
    </ol>
  );
}

/**
 * The route as one chain (the Visual language's "One chain"): a terminal, an AI agent, a folder and a skill, each
 * handing the next one a working piece, with the homepage at the end as the proof. The Title slide draws it as cards,
 * each section slide as a row of icons with its own piece in focus. Words arrive as props; it owns none.
 */
export function RouteChain(props: RouteChainProps) {
  return props.size === 'hero' ? <HeroChain {...props} /> : <MiniChain {...props} />;
}
