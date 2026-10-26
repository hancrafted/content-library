import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { Statement } from './statement';

// Untitled: no `title` in its Translation files, so it renders but the table of contents skips it.
export const whatComesNext = slide({
  slug: 'what-comes-next',
  messages: { en, de },
  content: ({ t }) => (
    <SlideFrame className="justify-center">
      <Statement>{t('statement')}</Statement>
    </SlideFrame>
  ),
});
