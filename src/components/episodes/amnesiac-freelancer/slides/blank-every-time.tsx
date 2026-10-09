import { SessionLoop } from '@/components/episodes/amnesiac-freelancer/client/session-loop.client';
import { BasicPageSlide } from '@/components/slide-master/basic-page-slide';
import { slidesFor } from '@/components/slide-master/episode-record';

const slide = slidesFor('amnesiac-freelancer');

export const blankEveryTime = slide({
  slug: 'blank-every-time',
  notes: [
    {
      slug: 'stateless-by-design',
      target: 'prose',
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
  segments: [{ slug: 'blank-slate' }, { slug: 'new-session-new-window' }, { slug: 'shifts', bridge: true }],
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
