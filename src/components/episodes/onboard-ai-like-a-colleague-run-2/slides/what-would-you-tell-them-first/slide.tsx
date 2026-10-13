import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { HorizontalRail } from './horizontal-rail.client';
import de from './i18n/de.json';
import en from './i18n/en.json';

/*
 * The same working day, now filled with what you would do: the horizontal-rail master, copied with changes. Four
 * hand-overs in the morning, a dashed gap while they work, then two check-ins in your colour. Each stop's time and
 * action read at rest; its dot opens one spoken line. The rail draws in by CSS each time the Slide becomes active.
 */
export const whatWouldYouTellThemFirst = slide({
  slug: 'what-would-you-tell-them-first',
  messages: { en, de },
  notes: [
    {
      slug: 'write-for-the-newcomer',
      target: 'timeline',
      sources: [
        {
          slug: 'documenting-architecture-decisions',
          url: 'https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions',
        },
      ],
    },
    {
      slug: 'checking-is-part-of-the-frame',
      target: 'checks',
      sources: [{ slug: 'claude-code-best-practices', url: 'https://code.claude.com/docs/en/best-practices' }],
    },
  ],
  segments: [
    { slug: 'take-a-second' },
    { slug: 'walk-the-morning' },
    { slug: 'tools-and-the-ask' },
    { slug: 'look-at-the-draft' },
  ],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <div {...target('timeline')} className="mt-12 md:my-auto md:py-12">
        <HorizontalRail
          label={t('heading')}
          checks={target('checks')}
          items={{
            a: { date: t('items.a.date'), title: t('items.a.title'), caption: t('items.a.caption') },
            b: { date: t('items.b.date'), title: t('items.b.title'), caption: t('items.b.caption') },
            c: { date: t('items.c.date'), title: t('items.c.title'), caption: t('items.c.caption') },
            d: { date: t('items.d.date'), title: t('items.d.title'), caption: t('items.d.caption') },
            e: { date: t('items.e.date'), title: t('items.e.title'), caption: t('items.e.caption') },
            f: { date: t('items.f.date'), title: t('items.f.title'), caption: t('items.f.caption') },
          }}
        />
      </div>
    </SlideFrame>
  ),
});
