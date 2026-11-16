import { Cross } from '@/episodes/components/slide-shared/seam-sum/marks';
import { FAIL_CHIP, type Half } from '@/episodes/components/slide-shared/seam-sum/types';

interface PartyResultProps {
  readonly title: string;
  readonly goal: string;
  readonly broken: readonly { readonly half: Half; readonly chip: string; readonly by: string }[];
  readonly fails: string;
}

/** "=" and the party the four cards add up to: its goal, failed, and which cards broke which half. */
export function PartyResult({ title, goal, broken, fails }: PartyResultProps) {
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
        <p data-result-goal className="text-caption text-muted-foreground">
          {goal}
        </p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {broken.map(({ half, chip, by }) => (
            <li key={half} data-broken={half} className="flex items-center gap-2">
              <span className={FAIL_CHIP}>{chip}</span> <span className="text-caption text-muted-foreground">{by}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
