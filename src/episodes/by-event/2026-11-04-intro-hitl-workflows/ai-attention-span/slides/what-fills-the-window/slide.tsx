import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { AttentionBubblePreset } from '@/explorables/context-window/context';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const whatFillsTheWindow = slide({
  slug: 'what-fills-the-window',
  messages: { en, de },
  presentation: {
    tone: 'inverse',
    style: {
      '--slide-surface': 'color-mix(in oklab, var(--tone-paper) 88%, var(--tone-ink))',
      '--slide-space-after': '265px',
    },
    enter: { effect: 'liquid' },
    leave: { effect: 'liquid' },
  },
  segments: [{ slug: 'more-in-there-than-you-typed' }],
  content: ({ t, locale }) => (
    <SlideFrame>
      <AttentionBubblePreset locale={locale} at="what-fills-the-window" punchline={t('punchline')} poll={t('poll')} />
    </SlideFrame>
  ),
});
