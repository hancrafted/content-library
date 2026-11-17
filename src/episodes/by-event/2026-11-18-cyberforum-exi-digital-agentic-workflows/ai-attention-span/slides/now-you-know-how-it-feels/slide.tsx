import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { AttentionBubblePreset } from '@/explorables/context-window/context';
import { SESSION_END } from '@/explorables/context-window/context-bars.pure';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const nowYouKnowHowItFeels = slide({
  slug: 'now-you-know-how-it-feels',
  messages: { en, de },
  segments: [{ slug: 'you-held-it-all' }],
  content: ({ t, locale }) => (
    <SlideFrame>
      <AttentionBubblePreset locale={locale} at={SESSION_END} punchline={t('punchline')} />
    </SlideFrame>
  ),
});
