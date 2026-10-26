import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { AttentionBubblePreset } from '@/explorable-explanations/context/context';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "What fills the window": the session bar from the shared `session` plan, filled up to and including this
// Section, which it names.
export const whatFillsTheWindow = slide({
  slug: 'what-fills-the-window',
  messages: { en, de },
  segments: [{ slug: 'more-in-there-than-you-typed' }],
  content: ({ t, locale }) => (
    <SlideFrame>
      <AttentionBubblePreset locale={locale} at="what-fills-the-window" punchline={t('punchline')} poll={t('poll')} />
    </SlideFrame>
  ),
});
