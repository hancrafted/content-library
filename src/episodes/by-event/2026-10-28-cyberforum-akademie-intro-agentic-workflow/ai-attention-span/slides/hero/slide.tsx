import { slide } from '@/episodes/components/slide-master/slide';
import { SlideBackdrop, SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { AttentionBubblePreset } from '@/explorables/context-window/context';
import de from './i18n/de.json';
import en from './i18n/en.json';

/**
 * The Title slide's hero Scene (the record's `title`): the AI's speech bubble every Section opener shows, here with
 * the session bar empty and no poll, since the audience starts fresh. The bar comes from the shared `session` plan. The shared header renders the h1 and the
 * caption above it. The empty Backdrop is the Title slide's one Backdrop, holding no glow.
 */
export const hero = slide({
  slug: 'hero',
  messages: { en, de },
  content: ({ t, locale }) => (
    <>
      <SlideBackdrop mobile />
      <SlideFrame className="mt-10">
        <AttentionBubblePreset locale={locale} at={null} punchline={t('punchline')} />
      </SlideFrame>
    </>
  ),
});
