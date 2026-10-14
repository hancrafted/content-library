import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { BoardColumn } from './board-column';
import { BoardNote } from './board-note';
import { ConvergeLines } from './converge-lines';
import de from './i18n/de.json';
import en from './i18n/en.json';

// A Scene from a copy of the master `grid-1x3`: it has no part below its columns, and the three gains converge
// on one result. Each column holds two sticky notes instead of a numeral and caption; the entrance is CSS only.
export const salesIsMoreThanSelling = slide({
  slug: 'sales-is-more-than-selling',
  messages: { en, de },
  notes: [
    {
      slug: 'founders-picture',
      target: 'insight',
      sources: [{ slug: 'graham-ds', url: 'https://paulgraham.com/ds.html' }],
    },
    {
      slug: 'early-deals-teach-process',
      target: 'process',
      sources: [{ slug: 'blank-startup', url: 'https://steveblank.com/2010/01/25/whats-a-startup-first-principles/' }],
    },
    {
      slug: 'investors-read-the-team',
      target: 'trust',
      sources: [{ slug: 'gompers-vc', url: 'https://www.nber.org/papers/w22587' }],
    },
    {
      slug: 'costly-signal',
      target: 'result',
      sources: [{ slug: 'spence-signaling', url: 'https://doi.org/10.2307/1882010' }],
    },
  ],
  segments: [{ slug: 'insight' }, { slug: 'process' }, { slug: 'trust' }, { slug: 'all-three-build-trust' }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption data-target="caption">{t('caption')}</SlideCaption>
      <div className="mt-10 grid grid-cols-1 gap-y-10 md:grid-cols-3 md:gap-x-10 lg:gap-x-14">
        <BoardColumn
          slug="insight"
          title={t('columns.insight.title')}
          items={[
            { slug: 'assumption', text: t('columns.insight.items.assumption') },
            { slug: 'feature', text: t('columns.insight.items.feature') },
          ]}
          firstStep={0}
          targetProps={target('insight')}
        />
        <BoardColumn
          slug="process"
          title={t('columns.process.title')}
          items={[
            { slug: 'who-buys', text: t('columns.process.items.who-buys') },
            { slug: 'pattern', text: t('columns.process.items.pattern') },
          ]}
          firstStep={2}
          targetProps={target('process')}
        />
        <BoardColumn
          slug="trust"
          title={t('columns.trust.title')}
          items={[
            { slug: 'loi', text: t('columns.trust.items.loi') },
            { slug: 'real-names', text: t('columns.trust.items.real-names') },
          ]}
          firstStep={4}
          targetProps={target('trust')}
        />
      </div>
      <div className="mt-4">
        <ConvergeLines />
      </div>
      <div {...target('result')} className="mx-auto mt-4 w-full max-w-sm">
        <BoardNote text={t('result')} tone="result" step={6} />
      </div>
    </SlideFrame>
  ),
});
