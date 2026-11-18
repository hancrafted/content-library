import { cn } from '@/shared/lib/utils';
import type { DefinitionWords } from './brief-or-pay-the-price.types';

type Heads = DefinitionWords['heads'];

const PILL = 'flex flex-1 basis-0 items-center justify-center gap-2 rounded-full border py-2 text-body font-semibold';

function FreelancerHead({ label }: { readonly label: string }) {
  return (
    <p className={cn(PILL, 'border-border bg-muted')}>
      <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
        <circle cx="8" cy="5.5" r="2.75" className="fill-none stroke-foreground" strokeWidth="1.4" />
        <path
          d="M2.75 14c.6-3 2.7-4.5 5.25-4.5s4.65 1.5 5.25 4.5"
          className="fill-none stroke-foreground"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      {label}
    </p>
  );
}

function AiHead({ label }: { readonly label: string }) {
  return (
    <p className={cn(PILL, 'border-ai/50 bg-ai/10 text-ai')}>
      <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
        <path d="M8 1.5 9.4 6.6 14.5 8 9.4 9.4 8 14.5 6.6 9.4 1.5 8 6.6 6.6Z" className="fill-ai" />
      </svg>
      {label}
    </p>
  );
}

// decision: FE-012 §4.5
export function MirrorHeadsView({ heads }: { readonly heads: Heads }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-2 @3xl:flex-nowrap" data-mirror-heads>
      <FreelancerHead label={heads.freelancer} />
      <p
        className={cn(
          'order-first w-full text-center text-caption font-semibold tracking-wide uppercase',
          '@3xl:order-none @3xl:w-60 @3xl:shrink-0 @3xl:self-center',
        )}
      >
        {heads.middle}
      </p>
      <AiHead label={heads.ai} />
    </div>
  );
}
