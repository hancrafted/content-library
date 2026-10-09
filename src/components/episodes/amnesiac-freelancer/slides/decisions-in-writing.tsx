import { BasicPageSlide } from '@/components/slide-master/basic-page-slide';
import { slidesFor } from '@/components/slide-master/episode-record';

const slide = slidesFor('amnesiac-freelancer');

const NYGARD = {
  slug: 'nygard-architecture-decisions',
  url: 'https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions',
};

export const decisionsInWriting = slide({
  slug: 'decisions-in-writing',
  minutes: { en: 3, de: 4 },
  notes: [
    { slug: 'a-conversation-with-a-future-developer', target: 'caption', sources: [NYGARD] },
    { slug: 'superseded-not-deleted', target: 'prose', sources: [NYGARD] },
    { slug: 'the-newcomers-two-bad-options', target: 'prose', sources: [NYGARD] },
    { slug: 'mapping-not-a-sourced-claim', target: 'prose' },
  ],
  segments: [
    { slug: 'why-it-was-done', from: 0.0, to: 1.0 },
    { slug: 'superseded', from: 1.0, to: 2.0 },
    { slug: 'our-agent-arrives-later-every-time', from: 2.0, to: 3.0, bridge: true },
  ],
  content: ({ t, ref, Title }) => (
    <BasicPageSlide
      title={<Title>{t('title')}</Title>}
      caption={t('caption')}
      prose={t.rich('prose', { ref: ref('superseded-not-deleted') })}
    />
  ),
});
