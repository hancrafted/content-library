import { externalHref } from '@/shared/lib/external-link.pure';
import Image from 'next/image';
import { ValueChainBoard, type ValueChainStage } from './value-chain-board.client';

export type { ValueChainStage } from './value-chain-board.client';

export interface ValueChainProps {
  readonly name: string;
  readonly role: string;
  readonly portrait: { readonly src: string; readonly alt: string };
  readonly statement: string;
  readonly statementAccent: string;
  readonly rail: string;
  readonly proofLabel: string;
  readonly booking: { readonly label: string; readonly href: string; readonly newTabHint: string };
  readonly stages: readonly ValueChainStage[];
}

const PORTRAIT_SIZE = 96;

function Intro({ name, role, portrait, statement, statementAccent }: ValueChainProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Image
          src={portrait.src}
          alt={portrait.alt}
          width={PORTRAIT_SIZE}
          height={PORTRAIT_SIZE}
          className="size-20 rounded-full object-cover object-top md:size-24"
        />
        <div>
          <p className="text-body font-semibold">{name}</p>
          <p className="text-caption text-muted-foreground">{role}</p>
        </div>
      </div>
      <p className="text-subheading font-semibold leading-tight">
        {statement} <span className="text-brand-accent">{statementAccent}</span>
      </p>
    </div>
  );
}

function Booking({ label, href, newTabHint }: ValueChainProps['booking']) {
  return (
    <p className="flex">
      <a
        href={externalHref(href)}
        target="_blank"
        rel="noopener noreferrer"
        className="card-hover card-hover--raise inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-body font-semibold text-primary-foreground shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {label}
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
          <path
            d="M7 17 17 7M9 7h8v8"
            className="fill-none stroke-current"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="sr-only"> ({newTabHint})</span>
      </a>
    </p>
  );
}

// decision: FE-002 §3.3
export function ValueChain(props: ValueChainProps) {
  return (
    <ValueChainBoard
      stages={props.stages}
      rail={props.rail}
      proofLabel={props.proofLabel}
      intro={<Intro {...props} />}
      action={<Booking {...props.booking} />}
    />
  );
}
