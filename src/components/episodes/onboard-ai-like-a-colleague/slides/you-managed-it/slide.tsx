import { BasicPageSlide } from '@/components/slide-master/basic-page-slide';
import { slide } from '@/components/slide-master/slide';
import { ArrowRight, ClipboardCheck, Pen } from 'lucide-react';
import de from './i18n/de.json';
import en from './i18n/en.json';

/*
 * The basic-page master as a single statement: the sentence as title and
 * caption, and in the prose slot one quiet figure, a pen, an arrow and a
 * checked clipboard, from doing to managing. Built without motion (Han's
 * decision for this Episode).
 */
export const youManagedIt = slide({
  slug: 'you-managed-it',
  messages: { en, de },
  notes: [
    {
      slug: 'work-moves',
      target: 'prose',
      sources: [{ slug: 'metr-early-2025-study', url: 'https://arxiv.org/abs/2507.09089' }],
    },
    {
      slug: 'employers-added-oversight',
      target: 'prose',
      sources: [{ slug: 'small-labor-market-effects', url: 'https://www.nber.org/papers/w33777' }],
    },
    {
      slug: 'why-novices-still-gain',
      target: 'caption',
      sources: [
        { slug: 'generative-ai-at-work', url: 'https://www.nber.org/papers/w31161' },
        {
          slug: 'jagged-technological-frontier',
          url: 'https://www.hbs.edu/ris/Publication%20Files/dell-acqua-et-al-2026-navigating-the-jagged-technological-frontier_5c589c8c-fbb5-458f-b285-c944746cd717.pdf',
        },
      ],
    },
  ],
  segments: [{ slug: 'what-you-did' }, { slug: 'doing-to-managing' }, { slug: 'not-about-rank' }],
  content: ({ t, Title }) => (
    <BasicPageSlide
      title={<Title>{t('title')}</Title>}
      caption={t('caption')}
      prose={
        <span role="img" aria-label={t('figure')} className="inline-flex items-center gap-4">
          <Pen aria-hidden className="size-10 text-muted-foreground" />
          <ArrowRight aria-hidden className="size-6 text-muted-foreground" />
          <ClipboardCheck aria-hidden className="size-10 text-human" />
        </span>
      }
    />
  ),
});
