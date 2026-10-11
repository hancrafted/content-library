import { slide } from '@/components/slide-master/slide';
import { ThreeColumnSlide } from '@/components/slide-master/three-column-slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const metaphorBreaks = slide({
  slug: 'metaphor-breaks',
  messages: { en, de },
  notes: [
    {
      slug: 'no-learning',
      target: 'no-learning',
      sources: [{ slug: 'claude-code-memory', url: 'https://code.claude.com/docs/en/memory' }],
    },
    {
      slug: 'context-not-enforcement',
      target: 'not-enforced',
      sources: [{ slug: 'claude-code-memory', url: 'https://code.claude.com/docs/en/memory' }],
    },
    {
      slug: 'reading-costs',
      target: 'reading-costs',
      sources: [{ slug: 'claude-code-best-practices', url: 'https://code.claude.com/docs/en/best-practices' }],
    },
    {
      slug: 'beyond-the-sources',
      target: 'not-enforced',
      sources: [
        { slug: 'agents-md', url: 'https://agents.md' },
        { slug: 'codex-agents-md', url: 'https://developers.openai.com/codex/guides/agents-md' },
      ],
    },
  ],
  segments: [{ slug: 'no-learning' }, { slug: 'not-enforced' }, { slug: 'reading-costs', bridge: true }],
  content: ({ t, Title }) => {
    const column = (slug: 'no-learning' | 'not-enforced' | 'reading-costs') => ({
      slug,
      title: t(`columns.${slug}.title`),
      prose: t(`columns.${slug}.prose`),
    });
    return (
      <ThreeColumnSlide
        title={<Title>{t('title')}</Title>}
        caption={t('caption')}
        columns={[column('no-learning'), column('not-enforced'), column('reading-costs')]}
      />
    );
  },
});
