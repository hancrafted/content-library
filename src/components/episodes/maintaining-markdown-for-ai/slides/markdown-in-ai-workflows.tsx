import { MarkdownRoles } from '@/components/episodes/maintaining-markdown-for-ai/markdown-roles';
import { slidesFor } from '@/components/slide-master/episode-record';
import { SectionSlide } from '@/components/slide-master/section-slide';
import { SlideProse } from '@/components/slide-master/slide-master';

const slide = slidesFor('maintaining-markdown-for-ai');

export const markdownInAiWorkflows = slide({
  slug: 'markdown-in-ai-workflows',
  notes: [
    { slug: 'three-contexts', target: 'title' },
    { slug: 'retrieval-cost', target: 'knowledge' },
  ],
  segments: [{ slug: 'agentic-era' }, { slug: 'three-categories', bridge: true }],
  content: ({ t, target, Title }) => (
    <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')}>
      <SlideProse>{t('prose')}</SlideProse>
      <MarkdownRoles knowledgeTarget={target('knowledge')} />
    </SectionSlide>
  ),
});
