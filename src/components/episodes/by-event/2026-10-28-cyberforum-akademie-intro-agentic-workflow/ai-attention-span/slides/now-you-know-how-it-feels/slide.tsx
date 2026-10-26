import { AttentionBubblePreset } from '@/components/explorable-explanations/context/context';
import { SESSION_END } from '@/components/explorable-explanations/context/context-bars.pure';
import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The closing Slide, last of the last Section: the AI's speech bubble over the session bar from the shared `session`
// plan, full, since the viewer has now held as much as an AI does. No poll: the AI says its line and the show is over.
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
