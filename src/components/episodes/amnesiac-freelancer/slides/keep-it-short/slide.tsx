import { BasicPageSlide } from '@/components/slide-master/basic-page-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const keepItShort = slide({
  slug: 'keep-it-short',
  messages: { en, de },
  notes: [
    {
      slug: 'bloat-gets-ignored',
      target: 'prose',
      sources: [{ slug: 'claude-code-best-practices', url: 'https://code.claude.com/docs/en/best-practices' }],
    },
    {
      slug: 'numbers-to-cite',
      target: 'prose',
      sources: [
        { slug: 'claude-code-memory', url: 'https://code.claude.com/docs/en/memory' },
        {
          slug: 'github-copilot-repository-instructions',
          url: 'https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions',
        },
      ],
    },
    {
      slug: 'minimal-is-not-short',
      target: 'caption',
      sources: [
        {
          slug: 'anthropic-context-engineering',
          url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
        },
        { slug: 'claude-code-memory', url: 'https://code.claude.com/docs/en/memory' },
      ],
    },
  ],
  segments: [{ slug: 'more-is-worse' }, { slug: 'prune' }, { slug: 'minimal-is-not-short', bridge: true }],
  content: ({ t, ref, Title }) => (
    <BasicPageSlide
      title={<Title>{t('title')}</Title>}
      caption={t('caption')}
      prose={t.rich('prose', { ref: ref('bloat-gets-ignored') })}
    />
  ),
});
