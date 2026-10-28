import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { Context } from '@/explorables/context-window/context';
import de from './i18n/de.json';
import en from './i18n/en.json';

/**
 * The page's last Slide: the primary Explorable with every option on. Context window (`gallery-full`) is a placeholder:
 * a copy swaps in its own Explorable and its fullest Preset. The Explorable floor's browser suite runs against this Slide.
 */
export const everyOptionOn = slide({
  slug: 'every-option-on',
  messages: { en, de },
  content: ({ locale }) => (
    <SlideFrame className="mt-8 gap-6">
      <Context preset="gallery-full" locale={locale} />
    </SlideFrame>
  ),
});
