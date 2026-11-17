import { slide } from '@/episodes/components/slide-master/slide';
import { SlideBackdrop, SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { AttentionBubblePreset } from '@/explorables/context-window/context';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const hero = slide({
  slug: 'hero',
  messages: { en, de },
  presentation: {
    tone: 'inverse',
    style: {
      '--slide-surface': 'color-mix(in oklab, var(--tone-paper) 88%, var(--tone-ink))',
      '--slide-space-after': '160px',
    },
    leave: { effect: 'liquid' },
  },
  content: ({ t, locale }) => (
    <>
      <SlideBackdrop mobile />
      <SlideFrame className="mt-10">
        <AttentionBubblePreset locale={locale} at={null} punchline={t('punchline')} />
      </SlideFrame>
    </>
  ),
});
