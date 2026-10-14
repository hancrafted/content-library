import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame, SlideTitle } from '@/components/slide-master/slide-master';
import { ChevronDown } from 'lucide-react';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './sales-is-more-than-selling.module.css';

/*
 * The three-column family composed as a Scene, so the convergence sits below
 * the three boxes, outside any prose paragraph. The dashed connector
 * marks three questions worked on together, not proven causes; the primary
 * border marks the one note to look at. The boxes and the trust note settle
 * in when the Slide becomes active; at rest, off active and under reduced
 * motion the finished picture shows.
 */

/** Each box by its slug, which is also the target its Speaker note names, and that note. */
const BOXES = [
  { slug: 'market-insight', note: 'two-different-intention-results' },
  { slug: 'customer-trust', note: 'commitment-is-not-trust' },
  { slug: 'internal-insight', note: 'what-the-internal-learning-trial-tested' },
] as const;

export const salesIsMoreThanSelling = slide({
  slug: 'sales-is-more-than-selling',
  messages: { en, de },
  notes: [
    {
      slug: 'two-different-intention-results',
      target: 'market-insight',
      sources: [
        { slug: 'murphy-hypothetical-bias', url: 'https://link.springer.com/article/10.1007/s10640-004-3332-z' },
        { slug: 'morwitz-purchase-intentions', url: 'https://doi.org/10.1016/j.ijforecast.2007.05.015' },
      ],
    },
    {
      slug: 'history-has-counter-evidence',
      target: 'trust-question',
      sources: [
        { slug: 'poppo-origins-of-trust', url: 'https://doi.org/10.1287/orsc.1070.0281' },
        { slug: 'doney-cannon-buyer-seller-trust', url: 'https://doi.org/10.2307/1251829' },
      ],
    },
    {
      slug: 'commitment-is-not-trust',
      target: 'customer-trust',
      sources: [{ slug: 'anderson-weitz-pledges', url: 'https://doi.org/10.2307/3172490' }],
    },
    {
      slug: 'what-the-internal-learning-trial-tested',
      target: 'internal-insight',
      sources: [{ slug: 'camuffo-scientific-approach', url: 'https://doi.org/10.1287/mnsc.2018.3249' }],
    },
  ],
  segments: [
    { slug: 'test-an-offer-not-applause' },
    { slug: 'learn-from-a-no' },
    { slug: 'early-buyers-are-a-small-sample' },
    { slug: 'give-reasons-to-keep-talking' },
    { slug: 'test-what-you-can-deliver' },
    { slug: 'turn-contact-into-a-learning-loop' },
  ],
  content: ({ t, ref, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption data-target="caption">{t('caption')}</SlideCaption>
      <div className="@container mt-auto pt-10">
        <ul className="grid gap-6 @xl:grid-cols-3">
          {BOXES.map(({ slug, note }) => (
            <li
              key={slug}
              {...target(slug)}
              className={`${styles.box} flex flex-col gap-2 rounded-xl border border-border bg-card p-5 text-card-foreground`}
            >
              <SlideTitle as="h4">{t(`boxes.${slug}.label`)}</SlideTitle>
              <p className="text-body text-muted-foreground">{t.rich(`boxes.${slug}.detail`, { ref: ref(note) })}</p>
            </li>
          ))}
        </ul>
        <div aria-hidden="true" className="flex flex-col items-center text-muted-foreground">
          <svg viewBox="0 0 300 48" preserveAspectRatio="none" className="hidden h-12 w-full @xl:block">
            {[50, 150, 250].map((x) => (
              <path
                key={x}
                d={`M${x} 0 L150 48`}
                fill="none"
                stroke="currentColor"
                strokeDasharray="4 4"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
          <span className="mt-2 h-8 border-l border-dashed border-border @xl:hidden" />
          <ChevronDown className="size-5" />
        </div>
        <div
          {...target('trust-question')}
          className={`${styles.trustNote} mx-auto flex max-w-md flex-col gap-1 rounded-xl border border-primary bg-card p-5 text-center`}
        >
          <p className="text-body font-semibold text-foreground">{t('trust.question')}</p>
          <p className="text-caption text-muted-foreground">
            {t.rich('trust.qualifier', { ref: ref('history-has-counter-evidence') })}
          </p>
        </div>
        <p className="mx-auto mt-8 max-w-prose border-t border-border pt-4 text-center text-body font-medium text-foreground">
          {t('conclusion')}
        </p>
      </div>
    </SlideFrame>
  ),
});
