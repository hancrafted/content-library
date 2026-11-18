import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { BriefOrPayThePrice } from '@/explorables/brief-or-pay-the-price/brief-or-pay-the-price';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const manageThePrice = slide({
  slug: 'manage-the-price',
  messages: { en, de },
  notes: [
    {
      slug: 'break-it-down',
      target: 'title',
      sources: [
        { slug: 'zhou-least-to-most', url: 'https://arxiv.org/abs/2205.10625' },
        { slug: 'press-compositionality-gap', url: 'https://arxiv.org/abs/2210.03350' },
      ],
    },
    {
      slug: 'requirements-first',
      target: 'title',
      sources: [{ slug: 'yang-underspecification', url: 'https://arxiv.org/abs/2505.13360' }],
    },
    {
      slug: 'interview-yourself-with-ai',
      target: 'title',
      sources: [
        { slug: 'vijayvargiya-ambig-swe', url: 'https://arxiv.org/abs/2502.13069' },
        { slug: 'li-eliciting-preferences', url: 'https://arxiv.org/abs/2310.11589' },
      ],
    },
    {
      slug: 'evaluate-each-step',
      target: 'title',
      sources: [
        { slug: 'lightman-verify-step-by-step', url: 'https://arxiv.org/abs/2305.20050' },
        { slug: 'huang-cannot-self-correct', url: 'https://arxiv.org/abs/2310.01798' },
      ],
    },
    {
      slug: 'fresh-start-for-each-piece',
      target: 'title',
      sources: [
        { slug: 'laban-lost-in-multi-turn', url: 'https://arxiv.org/abs/2505.06120' },
        { slug: 'hong-context-rot', url: 'https://www.trychroma.com/research/context-rot' },
      ],
    },
    {
      slug: 'a-limit-on-break-it-down',
      target: 'title',
      sources: [{ slug: 'dziri-faith-and-fate', url: 'https://arxiv.org/abs/2305.18654' }],
    },
  ],
  segments: [{ slug: 'refrain' }],
  content: ({ locale }) => (
    <SlideFrame className="mt-6 gap-6">
      <BriefOrPayThePrice preset="manage" locale={locale} />
    </SlideFrame>
  ),
});
