import { ContractCard, type ContractTermsProps } from '@/episodes/components/slide-shared/contract-card/contract-card';
import { cn } from '@/shared/lib/utils';

export interface SeamNote {
  readonly team: string;
  readonly fact: string;
  readonly detail: string;
  readonly agent?: string;
}

export interface SeamProps {
  readonly from: SeamNote;
  readonly to: SeamNote & { readonly external?: { readonly tag: string; readonly label: string } };
  readonly handoff: string;
  readonly contract?: ContractTermsProps;
}

function AgentBadge({ label }: { label: string }) {
  return (
    <span
      className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-ai bg-card text-ai"
      role="img"
      aria-label={label}
    >
      <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true">
        <path d="M8 1.5 L9.8 6.2 L14.5 8 L9.8 9.8 L8 14.5 L6.2 9.8 L1.5 8 L6.2 6.2 Z" className="fill-current" />
      </svg>
    </span>
  );
}

function ExternalTag({ tag, label }: { tag: string; label: string }) {
  return (
    <span
      data-external-tag
      className="flex h-6 shrink-0 items-center rounded-full border-2 border-dashed border-muted-foreground bg-card px-2 text-caption font-medium text-muted-foreground"
      role="img"
      aria-label={label}
    >
      {tag}
    </span>
  );
}

function SeamCard({ note, tilt }: { note: SeamProps['to']; tilt: string }) {
  const corner = note.external ? (
    <ExternalTag {...note.external} />
  ) : (
    note.agent !== undefined && <AgentBadge label={note.agent} />
  );
  return (
    <div
      data-seam-card
      data-agent={note.agent !== undefined || undefined}
      data-external={note.external !== undefined || undefined}
      className={cn('card-hover card-hover--raise relative flex flex-col gap-2 rounded-sm bg-card p-4 shadow-md', tilt)}
    >
      {corner && <span className="absolute -top-3 right-2">{corner}</span>}
      <span
        data-team
        className="self-start rounded-full bg-foreground px-3 py-0.5 text-caption font-medium text-background"
      >
        {note.team}
      </span>
      <p data-fact className="text-body font-semibold">
        {note.fact}
      </p>
      <p data-detail className="text-caption text-muted-foreground">
        {note.detail}
      </p>
    </div>
  );
}

function HandoffArrow({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 400 40" className="w-full" role="img" aria-label={label}>
      <line x1="4" y1="20" x2="390" y2="20" className="stroke-primary" strokeWidth="3" />
      <path
        d="M378 10 L392 20 L378 30"
        className="fill-none stroke-primary"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="200" cy="20" r="9" className="fill-primary" />
    </svg>
  );
}

export function Seam({ from, to, handoff, contract }: SeamProps) {
  return (
    <>
      <div className="pt-4 md:col-span-3">
        <SeamCard note={from} tilt="-rotate-1" />
      </div>
      <div className="flex flex-col gap-3 md:col-span-4 md:pt-8">
        <HandoffArrow label={handoff} />
        {contract && <ContractCard {...contract} />}
      </div>
      <div className="pt-4 md:col-span-3">
        <SeamCard note={to} tilt="rotate-1" />
      </div>
    </>
  );
}
