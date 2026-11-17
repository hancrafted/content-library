import { OversightPill } from '@/episodes/components/slide-shared/oversight-pill/oversight-pill';
import type { ReactNode } from 'react';
import { Callout } from './callout';

function ChainLink({ n, label, children }: { n: 1 | 2 | 3; label: string; children?: ReactNode }) {
  return (
    <div
      data-chain-link
      className="flex min-w-0 flex-1 flex-col gap-2 rounded-md border-2 border-foreground bg-card px-3 py-2"
    >
      <p className="flex items-center gap-2 text-body font-semibold">
        <Callout n={n} />
        <span data-chain-label>{label}</span>
      </p>
      {children}
    </div>
  );
}

function ChainArrow() {
  return (
    <svg viewBox="0 0 28 16" className="w-7 shrink-0 self-center rotate-90 @4xl:rotate-0" aria-hidden="true">
      <path d="M2 8H22M17 3L24 8L17 13" className="fill-none stroke-foreground" strokeWidth={2.5} />
    </svg>
  );
}

export interface TrustChainProps {
  readonly review: string;
  readonly trust: string;
  readonly step: string;
  readonly levels: readonly [string, string, string];
}

export function TrustChain({ review, trust, step, levels }: TrustChainProps) {
  return (
    <div className="flex flex-col items-stretch gap-2 @4xl:flex-row @4xl:items-stretch">
      <ChainLink n={1} label={review} />
      <ChainArrow />
      <ChainLink n={2} label={trust} />
      <ChainArrow />
      <ChainLink n={3} label={step}>
        <div className="flex flex-wrap gap-1">
          {levels.map((level) => (
            <OversightPill key={level} label={level} className="px-2" />
          ))}
        </div>
      </ChainLink>
    </div>
  );
}
