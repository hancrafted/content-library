import { MarkdownRoles } from '@/components/episodes/maintaining-markdown-for-ai/markdown-roles';
import { slidesFor } from '@/components/slide-master/episode-record';
import { SectionSlide } from '@/components/slide-master/section-slide';
import { SlideProse } from '@/components/slide-master/slide-master';

const slide = slidesFor('maintaining-markdown-for-ai');

export const markdownInAiWorkflows = slide({
  slug: 'markdown-in-ai-workflows',
  minutes: { en: 2, de: 2 },
  notes: [
    { slug: 'three-contexts', target: 'title' },
    { slug: 'retrieval-cost', target: 'knowledge' },
  ],
  segments: [
    { slug: 'agentic-era', from: 0.0, to: 0.75 },
    { slug: 'three-categories', from: 0.75, to: 1.5, bridge: true },
  ],
  content: ({ t, target, Title }) => (
    <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')}>
      <SlideProse>{t('prose')}</SlideProse>
      <MarkdownRoles knowledgeTarget={target('knowledge')['data-target']} />
    </SectionSlide>
  ),
});
