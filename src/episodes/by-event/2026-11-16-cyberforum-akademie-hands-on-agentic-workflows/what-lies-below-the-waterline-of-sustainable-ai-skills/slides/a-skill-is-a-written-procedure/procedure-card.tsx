import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { CardArt, type CardPart } from './card-art';

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

/** The drawing each extra carries in the pocket: the species guide with its fish, the label tag on its string, the arm preset with its lights. */
const EXTRA_ART: Readonly<Record<Extra, CardPart>> = { guide: 'guide', label: 'label', preset: 'preset' };

/** The sleeve's pocket: the three extras, each with its folder in the Coding agent view. */
function Pocket({ extras }: Pick<ProcedureCardProps, 'extras'>) {
  return (
    <ul
      data-card-part="pocket"
      className="focus-group__item relative isolate grid grid-cols-3 items-end gap-2 border-t-4 border-(--sleeve-edge) pt-3"
    >
      <CardArt part="pocketFront" fill className="pointer-events-none absolute inset-0 -z-10 size-full" />
      {EXTRAS.map((extra) => (
        <li key={extra} data-extra={extra} className="flex flex-col items-center gap-1 text-center">
          <CardArt part={EXTRA_ART[extra]} className="h-16 w-auto @md:h-20" />
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
    <div className="@container relative mx-auto w-full max-w-md pt-5">
      <CardArt part="clip" className="absolute top-0 left-1/2 z-10 h-12 w-auto -translate-x-1/2" />
      <div className="focus-group--dim-others relative isolate flex flex-col gap-3 border-4 border-(--sleeve-edge) bg-(--sleeve) p-3 pt-8">
        <CardArt part="sleeveGlint" fill className="pointer-events-none absolute inset-0 -z-10 size-full" />
        <div data-card-part="head" className="focus-group__item relative isolate p-4 pr-5 pb-5">
          <CardArt part="head" fill className="absolute inset-0 -z-10 size-full" />
          <p className="text-caption font-semibold text-muted-foreground">{label}</p>
          <p className="mt-2 text-body font-semibold text-foreground">{title}</p>
          <p className="mt-2 text-body text-foreground">
            <span className="underline decoration-primary decoration-2 underline-offset-4">
              <span className="font-semibold">{useWhenLead}</span> {useWhen}
            </span>
          </p>
        </div>
        <div data-card-part="body" className="focus-group__item relative isolate p-4 pr-5 pb-5">
          <CardArt part="body" fill className="absolute inset-0 -z-10 size-full" />
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
