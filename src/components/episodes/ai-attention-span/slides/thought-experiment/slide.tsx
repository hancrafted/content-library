import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { AttentionBubblePreset } from '@/components/slide-shared/context/context';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The opener of the Section "Thought experiment": the session bar from the shared `session` plan, filled up to and
// including this Section, which it names.
export const thoughtExperiment = slide({
  slug: 'thought-experiment',
  messages: { en, de },
  segments: [{ slug: 'a-long-chat-is-a-long-call' }],
  content: ({ t, locale }) => (
    <SlideFrame>
      <AttentionBubblePreset locale={locale} at="thought-experiment" punchline={t('punchline')} poll={t('poll')} />
    </SlideFrame>
  ),
});
