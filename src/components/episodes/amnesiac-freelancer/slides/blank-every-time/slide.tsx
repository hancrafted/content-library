import { BasicPageSlide } from '@/components/slide-master/basic-page-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { SessionLoop } from './session-loop.client';

export const blankEveryTime = slide({
  slug: 'blank-every-time',
  messages: { en, de },
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
