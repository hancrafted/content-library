import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { OutcomeCell, type Outcome } from './outcome-cell';

const PROKOP = {
  slug: 'prokop-historical-aerospace-software-errors',
  url: 'https://ntrs.nasa.gov/api/citations/20230012909/downloads/Historical%20Aerospace%20Software%20Errors.pdf',
};
const MUND = { slug: 'mund-quality-of-requirements-specifications', url: 'https://arxiv.org/abs/1702.07656' };

const WRONG_OUTPUT = 'missing-requirements-show-up-as-wrong-output';

/** The quadrant in reading order: tight row on top, the intent hit on the right. */
const QUADRANT: readonly Outcome[] = ['precise-off', 'precise-accurate', 'neither', 'accurate-scattered'];

/** An axis arrow, stretched along its axis: up for precision, right for accuracy. */
function AxisArrow({ direction }: { direction: 'up' | 'right' }) {
  const up = direction === 'up';
  return (
    <svg
      viewBox={up ? '0 0 16 200' : '0 0 400 16'}
      className={up ? 'w-4 flex-1' : 'h-4 w-full'}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d={up ? 'M8 196V8M2 16l6-8 6 8' : 'M4 8h388M384 2l8 6-8 6'}
        className="fill-none stroke-muted-foreground"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * "Precision and accuracy" (Spec Option 6a): a copy of the `grid-2x2` Master slide's quadrant whose axes carry the
 * meaning, precision up and accuracy right. Each cell pairs its dartboard, the shared `Dartboard` and `Darts`, with the
 * work order that lands at the bike bench, so the boards and the documents stand side by side in one frame. Keeps
 * `motion: none`; the cells dim each other on hover. Like the Master slide, the axes hide where the cells stack.
 */
export const precisionAndAccuracy = slide({
  slug: 'precision-and-accuracy',
  messages: { en, de },
  notes: [
    { slug: WRONG_OUTPUT, target: 'precise-off', sources: [PROKOP] },
    { slug: 'limits', target: 'limits', sources: [PROKOP, MUND] },
  ],
  segments: [{ slug: 'precision' }, { slug: 'accuracy' }, { slug: 'art-not-a-science' }],
  content: ({ t, target, marker, Marker }) => (
    <SlideFrame className="@container mt-8">
      <div className="flex flex-col gap-3">
        <div className="flex gap-4">
          <div className="hidden w-16 shrink-0 flex-col items-center justify-between py-4 text-caption font-semibold text-muted-foreground uppercase @3xl:flex">
            <span>{t('axes.tight')}</span>
            <AxisArrow direction="up" />
            <span>{t('axes.loose')}</span>
          </div>
          <ul className="focus-group focus-group--dim-others grid flex-1 grid-cols-1 gap-4 rounded-xl bg-muted p-3 @3xl:grid-cols-2 @3xl:p-4">
            {QUADRANT.map((outcome) => (
              <OutcomeCell
                key={outcome}
                outcome={outcome}
                words={{
                  name: t(`outcomes.${outcome}.name`),
                  workOrder: t('workOrder'),
                  sheet: t(`outcomes.${outcome}.sheet`),
                  benchLabel: t('atTheBench'),
                  bench: t(`outcomes.${outcome}.bench`),
                }}
                marker={outcome === 'precise-off' && <Marker note={WRONG_OUTPUT} placement="beside" />}
                targetProps={outcome === 'precise-off' ? target('precise-off') : undefined}
              />
            ))}
          </ul>
        </div>
        <div className="hidden items-center justify-between pr-4 pl-24 text-caption font-semibold text-muted-foreground uppercase @3xl:flex">
          <span>{t('axes.off')}</span>
          <span className="flex-1 px-4">
            <AxisArrow direction="right" />
          </span>
          <span>{t('axes.on')}</span>
        </div>
        <p className="hidden justify-between gap-6 pr-4 pl-24 text-caption text-muted-foreground @3xl:flex">
          <span>{t.rich('axes.precision')}</span>
          <span className="text-right">{t.rich('axes.accuracy')}</span>
        </p>
        <p className="text-caption text-muted-foreground @3xl:pr-4 @3xl:pl-24">
          {t.rich('evidence', { wrong: marker(WRONG_OUTPUT) })}{' '}
          <span {...target('limits')}>{t.rich('limits', { limits: marker('limits') })}</span>
        </p>
      </div>
    </SlideFrame>
  ),
});
