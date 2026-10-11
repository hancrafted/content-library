import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import { SlideProse } from '@/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { MarkdownRoles } from './markdown-roles';

export const markdownInAiWorkflows = slide({
  slug: 'markdown-in-ai-workflows',
  messages: { en, de },
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
