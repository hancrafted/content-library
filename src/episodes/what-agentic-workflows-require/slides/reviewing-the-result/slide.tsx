import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { ContractCard } from '@/episodes/components/slide-shared/contract-card/contract-card';
import { BoardNote, DoerBadge } from '@/episodes/components/slide-shared/party-board/sticky-note';
import { GoalCheck } from './goal-check';
import de from './i18n/de.json';
import en from './i18n/en.json';

const BOEHM = {
  slug: 'boehm-verifying-and-validating',
  url: 'https://mferchaves.wordpress.com/wp-content/uploads/2014/08/articulo_4.pdf',
};
const NASA_IVV = { slug: 'nasa-ivv-overview', url: 'https://www.nasa.gov/ivv-overview/' };

const CHECKS = ['headcount', 'budget', 'date'] as const;

function Fork() {
  return (
    <svg viewBox="0 0 120 80" className="hidden h-20 w-full @4xl:block" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M60 0 V30 M60 30 C 60 60, 20 50, 10 78 M60 30 C 60 60, 100 50, 110 78"
        className="fill-none stroke-foreground"
        strokeWidth={2.5}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export const reviewingTheResult = slide({
  slug: 'reviewing-the-result',
  messages: { en, de },
  captionNote: 'two-definitions',
  notes: [
    { slug: 'two-definitions', target: 'caption', sources: [BOEHM] },
    { slug: 'his-two-questions', target: 'verification', sources: [BOEHM] },
    { slug: 'where-the-fix-lands', target: 'validation', sources: [BOEHM] },
    { slug: 'software-practice-not-agents', target: 'verification', sources: [NASA_IVV] },
  ],
  segments: [
    { slug: 'two-checks' },
    { slug: 'paintball-passes' },
    { slug: 'the-human-part' },
    { slug: 'your-verdict' },
  ],
  content: ({ t, marker, Marker, target }) => (
    <SlideFrame className="@container">
      <div className="grid grid-cols-1 items-stretch gap-6 rounded-xl bg-muted p-5 @3xl:p-8 @4xl:grid-cols-12">
        <div className="flex flex-col justify-center gap-3 @4xl:col-span-3">
          <BoardNote
            kicker={t('result.kicker')}
            text={t('result.text')}
            hint={t('result.status')}
            tilt="left"
            badge={<DoerBadge doer="ai" label={t('badges.agent')} />}
            className="p-5"
          />
          <Fork />
          <p className="text-center text-caption text-muted-foreground">{t('fork')}</p>
        </div>
        <div {...target('verification')} className="flex flex-col gap-3 @4xl:col-span-4">
          <p className="text-caption text-muted-foreground uppercase">{t('verification.label')}</p>
          <p className="text-body font-semibold">
            {t.rich('verification.question', { q: marker('his-two-questions') })}
          </p>
          <ContractCard
            heading={t('verification.heading')}
            marks={{ passed: t('marks.passed'), failed: t('marks.failed') }}
            checks={CHECKS.map((check) => ({ label: t(`verification.checks.${check}`), passed: true }))}
          />
          <p data-verdict className="text-caption font-semibold">
            {t('verification.verdict')}
          </p>
        </div>
        <div {...target('validation')} className="flex flex-col gap-3 @4xl:col-span-5">
          <p className="flex items-center justify-between gap-2 text-caption text-muted-foreground uppercase">
            <span>{t('validation.label')}</span>
            <DoerBadge doer="human" label={t('badges.person')} />
          </p>
          <p className="text-body font-semibold">{t('validation.question')}</p>
          <GoalCheck
            goal={t('validation.goal')}
            finding={t('validation.finding')}
            seenOn={t.rich('validation.seenOn.fact', {
              card: () => (
                <b data-seen-on className="font-semibold text-foreground">
                  {t('validation.seenOn.card')}
                </b>
              ),
            })}
            why={t('validation.why')}
            fixLabel={
              <>
                {t('validation.fixLabel')}
                <Marker note="where-the-fix-lands" placement="beside" />
              </>
            }
            fix={t('validation.fix')}
            marks={{ failed: t('marks.failed'), fixed: t('marks.fixed') }}
          />
          <p data-verdict className="text-caption font-semibold text-destructive">
            {t('validation.verdict')}
          </p>
        </div>
      </div>
    </SlideFrame>
  ),
});
