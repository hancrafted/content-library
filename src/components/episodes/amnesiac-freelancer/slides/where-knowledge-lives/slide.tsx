import { slide } from '@/components/slide-master/slide';
import { ThreeColumnSlide } from '@/components/slide-master/three-column-slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const whereKnowledgeLives = slide({
  slug: 'where-knowledge-lives',
  messages: { en, de },
  notes: [
    {
      slug: 'training',
      target: 'training',
      sources: [
        { slug: 'claude-code-memory', url: 'https://code.claude.com/docs/en/memory' },
        { slug: 'codex-memories', url: 'https://developers.openai.com/codex/memories' },
      ],
    },
    {
      slug: 'the-session',
      target: 'session',
      sources: [
        { slug: 'chroma-context-rot', url: 'https://research.trychroma.com/context-rot' },
        { slug: 'lost-in-the-middle', url: 'https://arxiv.org/abs/2307.03172' },
        {
          slug: 'anthropic-context-engineering',
          url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
        },
      ],
    },
    {
      slug: 'files',
      target: 'files',
      sources: [
        { slug: 'claude-code-how-it-works', url: 'https://code.claude.com/docs/en/how-claude-code-works' },
        { slug: 'claude-code-memory', url: 'https://code.claude.com/docs/en/memory' },
      ],
    },
    {
      slug: 'compaction-is-lossy',
      target: 'session',
      sources: [
        {
          slug: 'anthropic-context-engineering',
          url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
        },
      ],
    },
  ],
  segments: [{ slug: 'training' }, { slug: 'the-session' }, { slug: 'files', bridge: true }],
  content: ({ t, Title }) => {
    const column = (slug: 'training' | 'session' | 'files') => ({
      slug,
      title: t(`columns.${slug}.title`),
      prose: t(`columns.${slug}.prose`),
    });
    return (
      <ThreeColumnSlide
        title={<Title>{t('title')}</Title>}
        caption={t('caption')}
        columns={[column('training'), column('session'), column('files')]}
      />
    );
  },
});
