import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { Context } from '@/explorables/context-window/context';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const everyOptionOn = slide({
  slug: 'every-option-on',
  messages: { en, de },
  content: ({ locale }) => (
    <SlideFrame className="mt-8 gap-6">
      <Context preset="gallery-full" locale={locale} />
    </SlideFrame>
  ),
});
