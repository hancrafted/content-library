import { cn } from '@/shared/lib/utils';
import type { CSSProperties } from 'react';
import styles from './loan.module.css';
import { BlockArt } from './sea-art';

export interface UpkeepStackProps {
  readonly label: string;
  readonly alt: string;
  readonly writing: { readonly label: string; readonly hint: string };
  readonly keeping: { readonly label: string; readonly hint: string };
  /** The paid blocks, bottom first, each lighting with its entry; then the next, not yet paid. */
  readonly blocks: readonly { readonly key: string; readonly label: string }[];
  readonly next: { readonly key: string; readonly label: string };
  readonly note: string;
}

const stepOf = (step: number) => ({ '--step': step }) as CSSProperties;

function Caption({ label, hint }: { readonly label: string; readonly hint: string }) {
  return (
    <p className="flex flex-col items-center text-center">
      <span className="text-caption font-semibold">{label}</span>
      <span className={cn('text-caption', styles.soft)}>{hint}</span>
    </p>
  );
}

/**
 * Writing weighed against keeping it right (Option 23b): one thin slab for the five minutes, a stack of one block per
 * fix, the Spec's faceted blocks with their lit tops beside it, each block lighting with its entry on the statement, and a dashed outline for the next. Heights are
 * illustration, labelled as such.
 */
export function UpkeepStack({ label, alt, writing, keeping, blocks, next, note }: UpkeepStackProps) {
  return (
    <div className={cn('rounded-xl p-5', styles.glass)}>
      <p className="text-body font-semibold">{label}</p>
      <div role="img" aria-label={alt} className="mt-4 grid grid-cols-2 items-end gap-x-6 gap-y-2">
        <BlockArt slab className="mx-auto" />
        <div className="flex flex-col-reverse">
          {blocks.map(({ key, label: block }, step) => (
            <div key={key} data-block={key} className="flex items-center gap-2">
              <BlockArt className={styles.light} style={stepOf(step + 1)} />
              <span className={cn('text-caption', styles.soft)}>{block}</span>
            </div>
          ))}
          <div data-block={next.key} data-unpaid="" className="flex items-center gap-2">
            <div className={cn('h-10 w-24 shrink-0', styles.unpaid)} />
            <span className={cn('text-caption', styles.soft)}>{next.label}</span>
          </div>
        </div>
        <Caption {...writing} />
        <Caption {...keeping} />
      </div>
      <p className={cn('mt-3 text-caption', styles.soft)}>{note}</p>
    </div>
  );
}
