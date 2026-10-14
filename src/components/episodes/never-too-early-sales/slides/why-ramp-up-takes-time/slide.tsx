import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { cn } from '@/lib/utils';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './why-ramp-up-takes-time.module.css';

/*
 * The three-column family composed as a Scene: three sticky-note boxes in the
 * three-column rhythm, then a band of three separate mechanisms and a footer,
 * which the three-column layout has no slot for. The band is no Gantt and no
 * sum: no arrows, no plus signs, no axis, no total. The boxes settle in when
 * the Slide becomes active.
 */

const BOXES = ['preparation', 'market', 'metrics'] as const;
/** Each mechanism and the target a note explains it by. */
const MECHANISMS = [
  { slug: 'construct', target: 'construct-pipeline' },
  { slug: 'learn', target: 'learn-selling-work' },
  { slug: 'buyer', target: 'buyer-decision-time' },
] as const;

export const whyRampUpTakesTime = slide({
  slug: 'why-ramp-up-takes-time',
  messages: { en, de },
  notes: [
    {
      slug: 'tenure-is-not-a-stopwatch-for-ramp-up',
      target: 'footer',
      sources: [
        {
          slug: 'peasley-hochstein-summary',
          url: 'https://kellercenter.hankamer.baylor.edu/news/story/2025/insights-optimizing-early-tenure-sales-success',
        },
      ],
    },
    {
      slug: 'training-evidence-has-a-narrow-setting',
      target: 'learn-selling-work',
      sources: [
        {
          slug: 'chung-kim-park',
          url: 'https://www.hbs.edu/ris/Publication%20Files/SF_Management_2020_0430_Final_1866af08-e5ee-4b12-9d51-7e3074d47c5d.pdf',
        },
      ],
    },
    {
      slug: 'budget-association-is-not-a-timing-prescription',
      target: 'preparation',
      sources: [{ slug: 'vomberg-et-al', url: 'https://doi.org/10.1177/00222437251367766' }],
    },
    {
      slug: 'buyer-led-journeys-are-conceptual-evidence',
      target: 'buyer-decision-time',
      sources: [{ slug: 'kalwey-et-al', url: 'https://doi.org/10.1177/00222429251338820' }],
    },
  ],
  segments: [
    { slug: 'preparation-is-real-work' },
    { slug: 'you-do-not-know-the-market-yet' },
    { slug: 'you-do-not-know-your-numbers-yet' },
    { slug: 'separate-the-sources-of-delay' },
    { slug: 'balance-new-leads-with-current-work' },
    { slug: 'start-learning-before-cash-is-urgent' },
  ],
  content: ({ t, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption data-target="caption">{t('caption')}</SlideCaption>
      <div className={cn(styles.scene, 'mt-auto flex flex-col gap-8 pt-10')}>
        <ul data-boxes className={cn(styles.boxes, 'grid gap-8')}>
          {BOXES.map((box) => (
            <li
              key={box}
              data-target={box}
              className={cn(styles.note, 'flex flex-col gap-1 rounded-md border border-border bg-card p-4')}
            >
              <span className="text-body font-semibold text-foreground">{t(`boxes.${box}.label`)}</span>
              <span className="text-caption text-muted-foreground">{t(`boxes.${box}.detail`)}</span>
            </li>
          ))}
        </ul>
        <ul data-band className={cn(styles.band, 'grid rounded-md border border-border bg-muted')}>
          {MECHANISMS.map(({ slug, target }) => (
            <li
              key={slug}
              data-target={target}
              className={cn(styles.bandCell, 'px-4 py-3 text-caption font-medium text-foreground')}
            >
              {t(`mechanisms.${slug}`)}
            </li>
          ))}
        </ul>
        <p data-target="footer" className="text-caption text-muted-foreground">
          {t('footer')}
        </p>
      </div>
    </SlideFrame>
  ),
});
