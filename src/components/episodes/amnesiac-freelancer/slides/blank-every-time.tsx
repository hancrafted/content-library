import { SessionLoop } from '@/components/episodes/amnesiac-freelancer/client/session-loop.client';
import { BasicPageSlide } from '@/components/slide-master/basic-page-slide';
import { slidesFor } from '@/components/slide-master/episode-record';

const slide = slidesFor('amnesiac-freelancer');

export const blankEveryTime = slide({
  slug: 'blank-every-time',
  minutes: { en: 3, de: 4 },
  notes: [
    {
      slug: 'stateless-by-design',
      target: 'stateless-by-design',
      sources: [
        { slug: 'openai-conversation-state', url: 'https://platform.openai.com/docs/guides/conversation-state' },
        {
          slug: 'claude-context-windows',
          url: 'https://platform.claude.com/docs/en/build-with-claude/context-windows',
        },
      ],
    },
    {
      slug: 'fresh-window-per-session',
      target: 'prose',
      sources: [{ slug: 'claude-code-memory', url: 'https://code.claude.com/docs/en/memory' }],
    },
    {
      slug: 'shift-workers-per-anthropic',
      target: 'prose',
      sources: [
        {
          slug: 'anthropic-long-running-harnesses',
          url: 'https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents',
        },
      ],
    },
    { slug: 'our-word-not-theirs', target: 'caption' },
  ],
  segments: [
    { slug: 'blank-slate', from: 0.0, to: 0.75 },
    { slug: 'new-session-new-window', from: 0.75, to: 1.75 },
    { slug: 'shifts', from: 1.75, to: 2.75, bridge: true },
  ],
  content: ({ t, ref, Title }) => (
    <>
      <BasicPageSlide
        title={<Title>{t('title')}</Title>}
        caption={t('caption')}
        prose={t.rich('prose', { ref: ref('stateless-by-design') })}
      />
      <SessionLoop caption={t('demo.caption')} />
    </>
  ),
});
