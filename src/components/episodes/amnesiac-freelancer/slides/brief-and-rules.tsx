import { slidesFor } from '@/components/slide-master/episode-record';
import { ThreeColumnSlide } from '@/components/slide-master/three-column-slide';

const slide = slidesFor('amnesiac-freelancer');

export const briefAndRules = slide({
  slug: 'brief-and-rules',
  minutes: { en: 4, de: 5 },
  notes: [
    {
      slug: 'the-brief',
      target: 'brief',
      sources: [
        {
          slug: 'claude-be-clear-and-direct',
          url: 'https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct',
        },
      ],
    },
    {
      slug: 'house-rules',
      target: 'house-rules',
      sources: [
        { slug: 'claude-code-best-practices', url: 'https://code.claude.com/docs/en/best-practices' },
        { slug: 'agents-md', url: 'https://agents.md' },
      ],
    },
    {
      slug: 'definition-of-done',
      target: 'definition-of-done',
      sources: [
        { slug: 'claude-code-best-practices', url: 'https://code.claude.com/docs/en/best-practices' },
        {
          slug: 'github-copilot-repository-instructions',
          url: 'https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions',
        },
      ],
    },
    {
      slug: 'colleague-test',
      target: 'brief',
      sources: [
        {
          slug: 'claude-be-clear-and-direct',
          url: 'https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct',
        },
      ],
    },
  ],
  segments: [
    { slug: 'the-brief', from: 0.0, to: 1.0 },
    { slug: 'house-rules', from: 1.0, to: 2.5 },
    { slug: 'definition-of-done', from: 2.5, to: 4.0, bridge: true },
  ],
  content: ({ t, Title }) => {
    const column = (slug: 'brief' | 'house-rules' | 'definition-of-done') => ({
      slug,
      title: t(`columns.${slug}.title`),
      prose: t(`columns.${slug}.prose`),
    });
    return (
      <ThreeColumnSlide
        title={<Title>{t('title')}</Title>}
        caption={t('caption')}
        columns={[column('brief'), column('house-rules'), column('definition-of-done')]}
      />
    );
  },
});
