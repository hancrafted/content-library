import { BasicPageSlide } from '@/components/slide-master/basic-page-slide';
import { slidesFor } from '@/components/slide-master/episode-record';

const slide = slidesFor('amnesiac-freelancer');

export const keepItShort = slide({
  slug: 'keep-it-short',
  minutes: { en: 3, de: 3 },
  notes: [
    {
      slug: 'bloat-gets-ignored',
      target: 'bloat-gets-ignored',
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
  segments: [
    { slug: 'more-is-worse', from: 0.0, to: 1.0 },
    { slug: 'prune', from: 1.0, to: 2.0 },
    { slug: 'minimal-is-not-short', from: 2.0, to: 3.0, bridge: true },
  ],
  content: ({ t, ref, Title }) => (
    <BasicPageSlide
      title={<Title>{t('title')}</Title>}
      caption={t('caption')}
      prose={t.rich('prose', { ref: ref('bloat-gets-ignored') })}
    />
  ),
});
