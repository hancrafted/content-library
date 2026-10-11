import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';

/**
 * The untitled Slide (FE-002 §2): a purely visual closing beat. Its `i18n/`
 * holds no `title`, so it renders but has no table-of-contents entry; a Voice
 * script here would still count toward the reading time.
 */
export const oneLine = slide({
  slug: 'one-line',
  messages: { en, de },
  content: ({ t }) => (
    <SlideFrame className="justify-center">
      <p className="max-w-3xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">{t('statement')}</p>
    </SlideFrame>
  ),
});
