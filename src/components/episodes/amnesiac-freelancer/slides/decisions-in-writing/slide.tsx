import { BasicPageSlide } from '@/components/slide-master/basic-page-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

const NYGARD = {
  slug: 'nygard-architecture-decisions',
  url: 'https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions',
};

export const decisionsInWriting = slide({
  slug: 'decisions-in-writing',
  messages: { en, de },
  notes: [
    { slug: 'a-conversation-with-a-future-developer', target: 'caption', sources: [NYGARD] },
    { slug: 'superseded-not-deleted', target: 'prose', sources: [NYGARD] },
    { slug: 'the-newcomers-two-bad-options', target: 'prose', sources: [NYGARD] },
    { slug: 'mapping-not-a-sourced-claim', target: 'prose' },
  ],
  segments: [
    { slug: 'why-it-was-done' },
    { slug: 'superseded' },
    { slug: 'our-agent-arrives-later-every-time', bridge: true },
  ],
  content: ({ t, ref, Title }) => (
    <BasicPageSlide
      title={<Title>{t('title')}</Title>}
      caption={t('caption')}
      prose={t.rich('prose', { ref: ref('superseded-not-deleted') })}
    />
  ),
});
