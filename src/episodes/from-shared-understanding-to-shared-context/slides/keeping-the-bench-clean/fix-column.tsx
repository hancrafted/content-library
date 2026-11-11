import { BenchVignette, type CleanId, type MessId } from '@/episodes/components/slide-shared/bike-bench/bench-vignette';
import type { ReactNode } from 'react';

export interface FixColumnProps {
  readonly fix: string;
  readonly mess: string;
  readonly verb: string;
  readonly how: string;
  readonly before: { readonly id: MessId; readonly label: string };
  readonly after: { readonly id: CleanId; readonly label: string };
  /** A Context marker beside the verb pill. */
  readonly marker?: ReactNode;
  readonly target?: { 'data-target': string };
}

/** One fix: the mess dulled, the verb pill in `primary` pointing down, and the clean state the fix leaves. */
export function FixColumn({ fix, mess, verb, how, before, after, marker, target }: FixColumnProps) {
  return (
    <div {...target} data-fix={fix} className="focus-group__item flex flex-col gap-3 rounded-xl bg-muted p-4">
      <p className="text-caption text-muted-foreground">{mess}</p>
      <div className="rounded-md bg-card p-1 opacity-60">
        <BenchVignette id={before.id} label={before.label} />
      </div>
      <div className="flex items-center justify-center gap-2">
        <svg viewBox="0 0 24 40" className="h-8 w-5" aria-hidden="true">
          <path
            d="M12 2 v32 m-8 -8 l8 8 l8 -8"
            className="fill-none stroke-primary"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="rounded-full bg-primary px-4 py-1 text-body font-semibold text-primary-foreground">
          {verb}
        </span>
        {marker}
      </div>
      <div className="rounded-md bg-card p-1 shadow-md">
        <BenchVignette id={after.id} label={after.label} />
      </div>
      <p className="text-caption font-medium">{how}</p>
    </div>
  );
}
