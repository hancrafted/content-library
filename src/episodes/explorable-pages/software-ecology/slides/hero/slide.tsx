import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { ExplorableHero } from '@/episodes/components/slide-shared/explorable-hero/explorable-hero';
import { HeroMotion } from '@/episodes/components/slide-shared/explorable-hero/hero-motion.client';
import { ToolPreview } from '@/episodes/components/slide-shared/explorable-hero/tool-preview';
import { scenarioLastStep } from '@/explorables/software-ecology/scenario-last-step';
import {
  LEVEL_RED,
  type CustomerReadout,
  type StationReadout,
} from '@/explorables/software-ecology/stage-readouts.pure';
import { FactoryPreview } from './factory-preview';
import { rackOf, type Release } from './factory-preview.pure';
import de from './i18n/de.json';
import en from './i18n/en.json';

/*
 * The model's readouts at week 20 of In practice with AI at Engineering (PLAY), read from the same headless run the Why How What
 * stills draw (`factoryStillState`), so the hero never claims what the model does not show: an illustrative model, not
 * measured, and labelled so on the preview.
 */

/** The main path a request rides, left to right: the preview's key, the work center's id and what marks it. */
const CENTERS = [
  { key: 'sales', id: 'sales' },
  { key: 'product', id: 'pm' },
  { key: 'analyst', id: 'ba' },
  { key: 'engineer', id: 'eng', ai: true },
  { key: 'qa', id: 'qa', inspection: true },
  { key: 'operations', id: 'ops' },
] as const;

const USE_CASE = 'tire';
/**
 * What the hero shows, as the Why How What stills do: In practice, AI at Engineering from week 4 writing two pull requests per task, run to week 20.
 * The AI-unbalanced tour this was, before the eval grill deleted the scenarios: the same settings, the same numbers.
 */
const PLAY = {
  start: 'realistic',
  steps: [{ run: 4 }, { set: { ai: ['eng'], dials: { eng: { aiExtra: 2 } } }, run: 8 }, { run: 20 }],
} as const;

/** The readings at that step: the Customer, each station by id, and the Customer's releases oldest first. */
function readoutsOf() {
  const snap = scenarioLastStep(USE_CASE, PLAY).f.read({});
  const customer: CustomerReadout = snap.customer;
  const releases = customer.releases
    .filter((release) => release !== null)
    .map((release): Release => (release.good ? 'good' : 'bad'))
    .reverse();
  const station = (id: string): StationReadout | undefined => snap.stations[id];
  return { customer, releases, station };
}

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
    const { customer, releases, station } = readoutsOf();
    const qa = station('qa');
    const weeks = Math.round(qa?.weeks ?? 0);
    const output = t('preview.output', { value: number.format(customer.output) });
    const satisfied = percent.format(customer.sat);
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
                releases,
              }}
              centers={CENTERS.map(({ id, ...center }) => ({
                ...center,
                waiting: station(id)?.waiting ?? 0,
                full: (station(id)?.level ?? 0) === LEVEL_RED,
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
