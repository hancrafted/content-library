import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import { SlideProse } from '@/components/slide-master/slide-master';
import { EffortCorpusChart } from './effort-corpus-chart';
import { EffortDecayChart } from './effort-decay-chart';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const volumeOutrunsReview = slide({
  slug: 'volume-outruns-review',
  messages: { en, de },
  notes: [
    { slug: 'decay-vs-drift', target: 'title' },
    { slug: 'corpus-compounding', target: 'corpus-chart' },
  ],
  segments: [{ slug: 'effort-decay' }, { slug: 'corpus-compounding', bridge: true }],
  content: ({ t, target, Title }) => (
    <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')}>
      <SlideProse>{t('prose')}</SlideProse>
      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        <figure className="min-w-0">
          <figcaption className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            One document decays
          </figcaption>
          <EffortDecayChart />
        </figure>
        <figure className="min-w-0">
          <figcaption className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            The corpus compounds
          </figcaption>
          <EffortCorpusChart {...target('corpus-chart')} />
        </figure>
      </div>
    </SectionSlide>
  ),
});
