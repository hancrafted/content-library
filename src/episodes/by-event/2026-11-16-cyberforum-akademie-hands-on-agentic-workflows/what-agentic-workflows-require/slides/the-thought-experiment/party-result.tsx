import { Cross } from '@/episodes/components/slide-shared/seam-sum/marks';
import { FAIL_CHIP, type Half } from '@/episodes/components/slide-shared/seam-sum/types';
import type { ReactNode } from 'react';

interface PartyResultProps {
  readonly title: string;
  readonly goal: string;
  /** The goal's two halves, each as the one sentence of its chip, such as "✗ together". */
  readonly chips: readonly { readonly half: Half; readonly text: string }[];
  readonly fails: string;
  /** Follows the goal, such as a Speaker note marker. */
  readonly marker?: ReactNode;
}

/** "=" and the party the four cards add up to: its goal, failed, and the two halves of it that broke. */
export function PartyResult({ title, goal, chips, fails, marker }: PartyResultProps) {
  return (
    <div className="flex items-center gap-4 px-1">
      <span aria-hidden className="self-center text-subheading font-semibold text-muted-foreground">
        =
      </span>
      <div
        data-sum-result
        className="relative flex flex-1 rotate-1 flex-wrap items-center gap-x-6 gap-y-2 rounded-sm border-2 border-destructive bg-card px-4 py-3 shadow-xl"
      >
        <Cross label={fails} />
        <p data-result-title className="text-body font-semibold">
          {title}
        </p>
        <p data-result-goal className="flex items-center gap-1.5 text-caption text-muted-foreground">
          {goal}
          {marker}
        </p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {chips.map(({ half, text }) => (
            <li key={half} data-broken={half}>
              <span className={FAIL_CHIP}>{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
