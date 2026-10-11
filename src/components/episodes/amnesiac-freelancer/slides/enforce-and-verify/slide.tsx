import { BasicPageSlide } from '@/components/slide-master/basic-page-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

const BEST_PRACTICES = { slug: 'claude-code-best-practices', url: 'https://code.claude.com/docs/en/best-practices' };

export const enforceAndVerify = slide({
  slug: 'enforce-and-verify',
  messages: { en, de },
  notes: [
    { slug: 'verification-you-can-run', target: 'prose', sources: [BEST_PRACTICES] },
    { slug: 'a-different-grader', target: 'caption', sources: [BEST_PRACTICES] },
    { slug: 'independent-of-prose', target: 'prose' },
    { slug: 'close', target: 'title' },
  ],
  segments: [{ slug: 'prove-it' }, { slug: 'another-pair-of-eyes' }, { slug: 'wrap-up', bridge: true }],
  content: ({ t, Title }) => (
    <BasicPageSlide title={<Title>{t('title')}</Title>} caption={t('caption')} prose={t('prose')} />
  ),
});
