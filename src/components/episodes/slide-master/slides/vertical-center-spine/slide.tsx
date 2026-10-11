import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { CentreSpine } from './vertical-center-spine';

// Timeline down one centre spine, entries alternating left and right. Every motion is CSS scroll-driven, so the
// Scene needs no client widget; without support or under reduced motion it rests in its final state.
export const verticalCenterSpine = slide({
  slug: 'vertical-center-spine',
  messages: { en, de },
  notes: [{ slug: 'layout', target: 'timeline' }],
  segments: [{ slug: 'walkthrough' }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <div {...target('timeline')} className="mt-12">
        <CentreSpine
          label={t('title')}
          entries={[
            { date: t('items.a.date'), title: t('items.a.title'), caption: t('items.a.caption') },
            { date: t('items.b.date'), title: t('items.b.title'), caption: t('items.b.caption') },
            { date: t('items.c.date'), title: t('items.c.title'), caption: t('items.c.caption') },
            { date: t('items.d.date'), title: t('items.d.title'), caption: t('items.d.caption') },
            { date: t('items.e.date'), title: t('items.e.title'), caption: t('items.e.caption') },
            { date: t('items.f.date'), title: t('items.f.title'), caption: t('items.f.caption') },
          ]}
        />
      </div>
    </SlideFrame>
  ),
});
