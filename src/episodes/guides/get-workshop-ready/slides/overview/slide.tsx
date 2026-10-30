import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { localizePath, stripLocale } from '@/shared/lib/locale.pure';
import { Checklist, type ChecklistStep, type LinkParts } from './checklist.client';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { BOXES, STEP_SLIDE, STEPS, type BoxId, type StepNumber } from './start-step.pure';

const W3C_MULTI_PAGE = { slug: 'w3c-multi-page-forms', url: 'https://www.w3.org/WAI/tutorials/forms/multi-page/' };
const ENDOWED_PROGRESS = { slug: 'nunes-dreze-endowed-progress', url: 'https://doi.org/10.1086/500480' };
const MINIMAL_MANUAL = { slug: 'lazonder-minimal-manual', url: 'https://doi.org/10.1006/imms.1993.1081' };
const EXPERTISE_REVERSAL = { slug: 'kalyuga-expertise-reversal', url: 'https://doi.org/10.1207/S15326985EP3801_4' };

/** A Slide link split into the path and anchor that `localizePath` takes, the one `href` FE-003 allows. */
function linkParts(link: string): LinkParts {
  const [path = '', anchor] = link.split('#');
  return { path, anchor };
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 shrink-0" aria-hidden="true">
      <path
        d="M5 12h13M13 6l6 6-6 6"
        className="fill-none stroke-foreground"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Overview (Spec Option 1a, reshaped by feedback round 2): four steps as an interactive checklist, the viewer ticks what
 * they already have and the top card on the right names the first step still open and links to its first Slide. The
 * technical route stays a link to the last Section. No toolbar; ticks live in the client part and die on reload.
 */
export const overview = slide({
  slug: 'overview',
  messages: { en, de },
  notes: [
    { slug: 'say-how-many-steps', target: 'count', sources: [W3C_MULTI_PAGE] },
    { slug: 'a-head-start-finishes-more', target: 'head-start', sources: [ENDOWED_PROGRESS] },
    { slug: 'minimal-still-needs-a-way-out', target: 'stuck', sources: [MINIMAL_MANUAL, EXPERTISE_REVERSAL] },
  ],
  segments: [{ slug: 'four-pieces-one-chain' }, { slug: 'skip-what-you-have' }],
  content: ({ t, locale, slideHref, target, marker, Marker }) => {
    const steps: ChecklistStep[] = STEPS.map((n: StepNumber) => ({
      n,
      section: t(`checklist.steps.${n}.section`),
      title: t(`checklist.steps.${n}.title`),
      boxes: Object.fromEntries(
        BOXES.filter((box) => box.step === n).map((box) => [box.id, t(`checklist.boxes.${box.id}`)]),
      ) as Partial<Record<BoxId, string>>,
    }));
    const technical = linkParts(slideHref('the-technical-route'));
    const hrefs = Object.fromEntries(STEPS.map((n) => [n, linkParts(slideHref(STEP_SLIDE[n]))])) as Record<
      StepNumber,
      LinkParts
    >;
    return (
      <SlideFrame className="@container gap-6">
        <div className="flex flex-col gap-3 @3xl:flex-row @3xl:items-center @3xl:justify-between">
          <span
            {...target('count')}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card py-1.5 pr-1.5 pl-4 text-caption"
          >
            <b className="font-semibold">{t('count')}</b>
            <span className="text-muted-foreground">· {t('time')}</span>
            <Marker note="say-how-many-steps" placement="beside" />
          </span>
          <span className="text-caption text-muted-foreground">{t('chainLine')}</span>
        </div>
        <Checklist
          steps={steps}
          hrefs={hrefs}
          locale={locale}
          words={{
            label: t('checklist.label'),
            open: t('card.open'),
            start: t('card.start', { n: '{n}' }),
            allDone: t('card.allDone'),
          }}
          intro={
            <span {...target('head-start')}>
              {t('checklist.intro')}
              <Marker note="a-head-start-finishes-more" placement="beside" />
            </span>
          }
        >
          <a
            data-skip="technical"
            href={localizePath(stripLocale(technical.path), locale, technical.anchor)}
            className="card-hover card-hover--outline flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-6 py-5"
          >
            <span className="flex flex-col">
              <span className="text-caption text-muted-foreground">{t('technical.lead')}</span>
              <span className="text-body font-semibold">{t('technical.action')}</span>
            </span>
            <ArrowRight />
          </a>
          <div
            {...target('stuck')}
            className="flex items-start gap-3 rounded-2xl border border-dashed border-border p-5"
          >
            <svg viewBox="0 0 24 24" className="mt-0.5 size-5 shrink-0" aria-hidden="true">
              <circle cx="12" cy="12" r="9" className="fill-none stroke-muted-foreground" strokeWidth="1.5" />
              <path
                d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7M12 17h.01"
                className="fill-none stroke-muted-foreground"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <p className="text-caption text-muted-foreground">
              {t.rich('stuck', {
                b: (chunks) => <b className="font-semibold text-foreground">{chunks}</b>,
                marker: marker('minimal-still-needs-a-way-out'),
              })}
            </p>
          </div>
        </Checklist>
      </SlideFrame>
    );
  },
});
