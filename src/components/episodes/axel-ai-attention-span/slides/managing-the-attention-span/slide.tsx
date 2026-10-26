import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { AttentionBubblePreset } from '@/components/slide-shared/context/context';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "Managing the attention span": the AI's speech bubble over the session bar from the shared
// `session` plan, filled up to and including this Section, which it names.
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
