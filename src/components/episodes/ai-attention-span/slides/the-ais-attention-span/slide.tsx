import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { AttentionBubblePreset } from '@/components/slide-shared/context/context';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "The AI's attention span": the session bar from the shared `session` plan, filled up to and including this
// Section, which it names.
export const theAisAttentionSpan = slide({
  slug: 'the-ais-attention-span',
  messages: { en, de },
  segments: [{ slug: 'why-it-happens' }],
  content: ({ t, locale }) => (
    <SlideFrame>
      <AttentionBubblePreset locale={locale} at="the-ais-attention-span" punchline={t('punchline')} poll={t('poll')} />
    </SlideFrame>
  ),
});
