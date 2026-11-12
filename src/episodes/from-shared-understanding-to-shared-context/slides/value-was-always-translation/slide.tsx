import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { PersonIcon } from '@/episodes/components/slide-shared/factory-line/icons';
import { cn } from '@/shared/lib/utils';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { ResultIconSvg, type ResultIcon } from './result-icon';

const BROOKS = { slug: 'brooks-no-silver-bullet', url: 'https://www.cgl.ucsf.edu/Outreach/pc204/NoSilverBullet.html' };

/** The three forms one intent was translated into, each a paper card tilted its own way. */
const RESULTS: readonly { slug: 'product' | 'service' | 'lecture'; icon: ResultIcon; tilt: string }[] = [
  { slug: 'product', icon: 'box', tilt: '-rotate-1' },
  { slug: 'service', icon: 'handshake', tilt: 'rotate-1' },
  { slug: 'lecture', icon: 'lectern', tilt: '-rotate-1' },
];

/** A half's mono index and label, its dot in the meaning colour of what the half holds. */
function HalfLabel({ index, label, dot }: { index: string; label: string; dot: string }) {
  return (
    <span className="flex items-center gap-3 font-mono text-caption text-muted-foreground uppercase">
      <span aria-hidden="true" className={cn('size-2 rounded-full', dot)} />
      {index} · {label}
    </span>
  );
}

/** The round arrow badge on the hairline, the translation: it points down where the halves stack, right where they face. */
function TranslationArrow() {
  return (
    <span
      data-translation-arrow
      aria-hidden="true"
      className="absolute -top-6 left-1/2 flex size-12 -translate-x-1/2 rotate-90 items-center justify-center rounded-full bg-primary text-primary-foreground @3xl:top-1/2 @3xl:-left-6 @3xl:translate-x-0 @3xl:-translate-y-1/2 @3xl:rotate-0"
    >
      <svg viewBox="0 0 24 24" className="size-6">
        <path
          d="M4 12h14M13 6l6 6-6 6"
          className="fill-none stroke-current"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/**
 * "Value was always translation" (Spec Option 4b): a copy of the `grid-1x2` Master slide's facing halves, hairline and
 * mono index, each half's title and caption replaced by a picture. One customer's intent on the left, the product,
 * service and lecture it was translated into on the right, and the round `primary` arrow on the hairline as the
 * translation. Keeps `motion: none`; the result cards dim each other on hover. The caption's last Context marker is
 * the header's; the first sits beside the translated half's label, since the shared header ends a caption on one.
 */
export const valueWasAlwaysTranslation = slide({
  slug: 'value-was-always-translation',
  messages: { en, de },
  captionNote: 'how-strong-the-evidence-is',
  notes: [
    { slug: 'the-hard-part-is-the-concept', target: 'caption', sources: [BROOKS] },
    { slug: 'how-strong-the-evidence-is', target: 'caption', sources: [BROOKS] },
  ],
  segments: [{ slug: 'every-effort-is-a-translation' }, { slug: 'a-translation-layer' }],
  content: ({ t, Marker }) => (
    <SlideFrame className="@container mt-8">
      <div className="grid grid-cols-1 divide-y divide-border border-y border-border @3xl:grid-cols-2 @3xl:divide-x @3xl:divide-y-0">
        <div data-intent className="flex flex-col justify-between gap-8 py-8 @3xl:gap-10 @3xl:py-10 @3xl:pr-12">
          <HalfLabel index={t('intent.index')} label={t('intent.label')} dot="bg-human" />
          <div className="flex items-end gap-4 @3xl:gap-5">
            <PersonIcon className="size-14 @3xl:size-20" />
            <div className="relative flex-1 rounded-2xl border-2 border-human bg-card p-5 shadow-md @3xl:p-6">
              <p className="text-caption font-semibold text-human uppercase">{t('intent.who')}</p>
              <p className="mt-2 text-body font-medium">{t('intent.quote')}</p>
              <svg viewBox="0 0 24 16" className="absolute -bottom-4 left-8 h-4 w-6" aria-hidden="true">
                <path d="M0 0h24L4 16z" className="fill-card" />
                <path d="M0 0 4 16 24 0" className="fill-none stroke-human" strokeWidth={2} />
              </svg>
            </div>
          </div>
          <p className="text-subheading font-semibold">{t('intent.statement')}</p>
        </div>
        <div className="relative flex flex-col justify-between gap-8 py-10 @3xl:gap-10 @3xl:pl-12">
          <TranslationArrow />
          <span className="flex items-center gap-1">
            <HalfLabel index={t('results.index')} label={t('results.label')} dot="bg-primary" />
            <Marker note="the-hard-part-is-the-concept" placement="beside" />
          </span>
          <ul className="focus-group focus-group--dim-others grid grid-cols-3 gap-3 @3xl:gap-4">
            {RESULTS.map(({ slug, icon, tilt }) => (
              <li
                key={slug}
                data-result
                className={cn(
                  'focus-group__item card-hover card-hover--raise flex min-w-0 flex-col items-center gap-3 rounded-xl border border-border bg-card p-3 text-center shadow-md @3xl:p-4',
                  tilt,
                )}
              >
                <ResultIconSvg icon={icon} />
                <p data-result-kind className="text-caption text-muted-foreground uppercase">
                  {t(`results.items.${slug}.kind`)}
                </p>
                <p className="text-body font-semibold">{t(`results.items.${slug}.name`)}</p>
              </li>
            ))}
          </ul>
          <p className="text-subheading font-semibold">{t('results.statement')}</p>
        </div>
      </div>
    </SlideFrame>
  ),
});
