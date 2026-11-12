import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { ExplorableHero } from '@/episodes/components/slide-shared/explorable-hero/explorable-hero';
import { HeroMotion } from '@/episodes/components/slide-shared/explorable-hero/hero-motion.client';
import { ToolPreview } from '@/episodes/components/slide-shared/explorable-hero/tool-preview';
import { FactoryPreview } from './factory-preview';
import { rackOf, satisfactionOf, type Release } from './factory-preview.pure';
import de from './i18n/de.json';
import en from './i18n/en.json';

/*
 * The model's readouts at the AI unbalanced tour's step 3, week 20, as the prototype shows them (Spec Option 0a): an
 * illustrative model, not measured, and labelled so on the preview. The Play Section pins the same readouts as
 * `expect:` claims on that tour step, so the hero never claims what the model does not show.
 */
const READOUTS = {
  /** Output relative to Ideal: `customer.output`. */
  output: 0.53,
  /** Quality assurance's weeks of work waiting: `qa.weeksWaiting`. */
  qaWeeksWaiting: 10.04,
  /** The last twelve releases, oldest first: eight good, four bad, so 67 % satisfied. */
  releases: ['good', 'good', 'bad', 'good', 'good', 'bad', 'good', 'bad', 'good', 'good', 'bad', 'good'] as Release[],
} as const;

/** The main path a request rides, left to right, and each work center's backlog at that step. */
const CENTERS = [
  { key: 'sales', waiting: 1 },
  { key: 'product', waiting: 2 },
  { key: 'analyst', waiting: 1 },
  { key: 'engineer', waiting: 1, ai: true },
  { key: 'qa', waiting: 223, full: true, inspection: true },
  { key: 'operations', waiting: 0 },
] as const;

/**
 * The Title slide's hero Scene for the Software ecology page (the record's `title`): its own headline and lede, the
 * Explorable hero over the two glow layers alone (no drift story: the motif lives in the preview), and a static preview
 * of the factory with AI at the engineer flooding quality assurance.
 */
export const hero = slide({
  slug: 'hero',
  messages: { en, de },
  presentation: {
    tone: 'inverse',
    style: { '--slide-space-after': '320px' },
    leave: { effect: 'liquid', style: { '--slide-transition-start-offset': '-160px' } },
    rear: (
      <>
        <div className="hero-glow absolute inset-0 text-brand-accent opacity-60" />
        <div className="hero-glow hero-glow--accent absolute inset-0 text-brand-accent opacity-60" />
      </>
    ),
    rearMobile: true,
    Provider: HeroMotion,
  },
  content: ({ t, locale, slideHref }) => {
    const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
    const percent = new Intl.NumberFormat(locale, { style: 'percent' });
    const weeks = Math.round(READOUTS.qaWeeksWaiting);
    const output = t('preview.output', { value: number.format(READOUTS.output) });
    const satisfied = percent.format(satisfactionOf(READOUTS.releases));
    const qa = CENTERS.find(({ key }) => key === 'qa');
    return (
      <ExplorableHero
        layers={{ Frame: SlideFrame }}
        locale={locale}
        tryIt={{ label: t('tryIt'), href: slideHref('factory') }}
        why={{ label: t('why'), href: slideHref('why-how-what') }}
        share={{
          title: t('share.title'),
          text: t('share.text'),
          labels: { copy: t('share.copy'), copied: t('share.copied') },
        }}
        motion={{ pause: t('motion.pause'), play: t('motion.play'), stilled: t('motion.stilled') }}
        preview={
          <ToolPreview
            label={t('preview.label', { weeks, output, satisfied })}
            title={t('preview.title')}
            tag={t('preview.tag')}
            note={t('preview.illustrative')}
          >
            <FactoryPreview
              customer={{
                label: t('preview.customer'),
                output,
                satisfied: t('preview.satisfied', { value: satisfied }),
                releases: READOUTS.releases,
              }}
              centers={CENTERS.map((center) => ({
                ...center,
                label:
                  center.key === 'qa'
                    ? t('preview.waiting', { center: t('preview.centers.qa'), weeks })
                    : t(`preview.centers.${center.key}`),
              }))}
              overflow={`+${rackOf(qa?.waiting ?? 0).overflow}`}
            />
          </ToolPreview>
        }
      />
    );
  },
});
