import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { AttentionBubblePreset } from '@/explorables/context-window/context';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const managingTheAttentionSpan = slide({
  slug: 'managing-the-attention-span',
  messages: { en, de },
  segments: [{ slug: 'you-manage-by-habit' }],
  content: ({ t, locale }) => (
    <SlideFrame>
      <AttentionBubblePreset
        locale={locale}
        at="managing-the-attention-span"
        punchline={t('punchline')}
        poll={t('poll')}
      />
    </SlideFrame>
  ),
});
