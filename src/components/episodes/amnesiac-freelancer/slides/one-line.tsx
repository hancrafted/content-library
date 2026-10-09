import { slidesFor } from '@/components/slide-master/episode-record';
import { SlideFrame } from '@/components/slide-master/slide-master';

const slide = slidesFor('amnesiac-freelancer');

/**
 * The untitled Slide (FE-002 §2): a purely visual closing beat. Its subtree
 * holds no `title`, so it renders but has no table-of-contents entry; its
 * minutes still count toward the reading time.
 */
export const oneLine = slide({
  slug: 'one-line',
  minutes: { en: 1, de: 1 },
  content: ({ t }) => (
    <SlideFrame className="justify-center">
      <p className="max-w-3xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">{t('statement')}</p>
    </SlideFrame>
  ),
});
