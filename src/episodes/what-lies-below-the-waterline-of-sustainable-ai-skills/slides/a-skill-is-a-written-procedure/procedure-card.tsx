import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';

/** The three extras the sleeve's pocket carries, each with the folder it sits in on disk. */
export type Extra = 'guide' | 'label' | 'preset';
export const EXTRAS: readonly Extra[] = ['guide', 'label', 'preset'];
export const EXTRA_FOLDER: Readonly<Record<Extra, string>> = {
  guide: 'references/',
  label: 'assets/',
  preset: 'scripts/',
};

export interface ProcedureCardProps {
  readonly label: string;
  readonly title: string;
  readonly useWhenLead: string;
  readonly useWhen: string;
  readonly backLabel: string;
  readonly steps: readonly string[];
  readonly extras: Readonly<Record<Extra, string>>;
}

/** The shapes of each extra's drawing: the species guide with its fish, the label template, the arm preset. */
const EXTRA_SHAPES: Readonly<Record<Extra, readonly { readonly points: string; readonly fill: string }[]>> = {
  guide: [
    { points: '6,4 52,2 54,42 8,42', fill: 'fill-(--guide)' },
    { points: '6,4 12,4 14,42 8,42', fill: 'fill-(--clip-shade)' },
    { points: '20,18 34,12 42,20 34,26', fill: 'fill-(--fish)' },
    { points: '42,20 50,14 50,26', fill: 'fill-(--fish)' },
    { points: '22,32 32,28 38,33 31,37', fill: 'fill-(--fish)' },
  ],
  label: [
    { points: '4,8 44,6 56,22 44,38 4,36', fill: 'fill-(--paper)' },
    { points: '4,8 44,6 56,22 4,22', fill: 'fill-(--paper-shade)' },
    { points: '10,14 36,14 36,16 10,16', fill: 'fill-(--clip-shade)' },
    { points: '10,26 30,26 30,28 10,28', fill: 'fill-(--clip-shade)' },
    { points: '45,20 49,20 49,24 45,24', fill: 'fill-(--clip)' },
  ],
  preset: [
    { points: '6,6 54,4 56,40 6,40', fill: 'fill-(--preset)' },
    { points: '6,6 54,4 54,12 6,14', fill: 'fill-(--clip)' },
    { points: '16,32 26,18 30,20 21,34', fill: 'fill-(--preset-arm)' },
    { points: '26,18 44,14 45,18 29,22', fill: 'fill-(--preset-arm)' },
    { points: '44,12 50,10 50,22 44,20', fill: 'fill-(--preset-arm)' },
  ],
};

/** A small low-poly drawing of one extra. */
function ExtraArt({ extra }: { readonly extra: Extra }) {
  return (
    <svg viewBox="0 0 60 44" aria-hidden className="h-10 w-auto">
      {EXTRA_SHAPES[extra].map(({ points, fill }) => (
        <polygon key={points} points={points} className={fill} />
      ))}
    </svg>
  );
}

/** The clipboard's clip, drawn above the sleeve. */
function Clip() {
  return (
    <svg viewBox="0 0 120 40" aria-hidden className="absolute top-0 left-1/2 h-10 w-28 -translate-x-1/2">
      <polygon points="18,6 102,6 108,40 12,40" className="fill-(--clip)" />
      <polygon points="18,6 60,6 54,40 12,40" className="fill-(--clip-shade)" />
      <polygon points="34,0 86,0 92,14 28,14" className="fill-(--clip-shade)" />
    </svg>
  );
}

/** The sleeve's pocket: the three extras, each with its folder in the Coding agent view. */
function Pocket({ extras }: Pick<ProcedureCardProps, 'extras'>) {
  return (
    <ul
      data-card-part="pocket"
      className="focus-group__item grid grid-cols-3 gap-2 border-t-2 border-(--sleeve-edge) pt-3"
    >
      {EXTRAS.map((extra) => (
        <li key={extra} data-extra={extra} className="flex flex-col items-center gap-1 text-center">
          <ExtraArt extra={extra} />
          <span className="text-caption font-semibold text-foreground">{extras[extra]}</span>
          <InView view="coding" className="rounded-sm bg-foreground px-1.5 font-mono text-caption text-background">
            {EXTRA_FOLDER[extra]}
          </InView>
        </li>
      ))}
    </ul>
  );
}

/**
 * The procedure card in its clear sleeve, clipped to the clipboard: the head with its title and use-when line, the body
 * with its numbered steps, and the pocket with the three extras. One continuous drawing; pointing at a part dims the
 * other two. In the Coding agent view each extra carries the folder it sits in.
 */
export function ProcedureCard({ label, title, useWhenLead, useWhen, backLabel, steps, extras }: ProcedureCardProps) {
  return (
    <div className="relative mx-auto w-full max-w-md pt-5">
      <Clip />
      <div className="focus-group--dim-others flex flex-col gap-3 rounded-xl border-2 border-(--sleeve-edge) bg-(--sleeve) p-3 pt-7 shadow-md">
        <div data-card-part="head" className="focus-group__item rounded-md bg-(--paper) p-4 shadow-sm">
          <p className="text-caption font-semibold text-muted-foreground">{label}</p>
          <p className="mt-2 text-body font-semibold text-foreground">{title}</p>
          <p className="mt-2 text-body text-foreground">
            <span className="underline decoration-primary decoration-2 underline-offset-4">
              <span className="font-semibold">{useWhenLead}</span> {useWhen}
            </span>
          </p>
        </div>
        <div data-card-part="body" className="focus-group__item rounded-md bg-(--paper) p-4 shadow-sm">
          <p className="text-caption font-semibold text-muted-foreground">{backLabel}</p>
          <ol className="mt-2 flex list-decimal flex-col gap-0.5 pl-5 text-body text-foreground">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
        <Pocket extras={extras} />
      </div>
    </div>
  );
}
