import { Statement } from '@/components/episodes/page-template/canvas/statement';
import { slidesFor } from '@/components/slide-master/episode-record';
import { SlideFrame } from '@/components/slide-master/slide-master';

const slide = slidesFor('page-template');

// Untitled: no `title` in its Translation subtree, so it renders but the table of contents skips it.
export const whatComesNext = slide({
  slug: 'what-comes-next',
  content: ({ t }) => (
    <SlideFrame className="justify-center">
      <Statement>{t('statement')}</Statement>
    </SlideFrame>
  ),
});
