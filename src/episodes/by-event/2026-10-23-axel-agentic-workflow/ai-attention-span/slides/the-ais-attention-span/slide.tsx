import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { AttentionBubblePreset } from '@/explorables/context-window/context';
import de from './i18n/de.json';
import en from './i18n/en.json';

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
