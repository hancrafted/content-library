import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { zoneWordsFrom } from '@/episodes/components/slide-shared/iceberg/zone-words.pure';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import { WaterlineEcho } from '@/episodes/components/slide-shared/waterline-echo/waterline-echo';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "A thought experiment", echoing the Hero motif (picked Title-slide Option 0a). Your pilot of ten years, the AI model, on deck at the Surface. Its Voice script opens the Episode, since the
// Title slide has none.
export const aThoughtExperiment = slide({
  slug: 'a-thought-experiment',
  messages: { en, de },
  presentation: atDepth(0, 'section'),
  segments: [{ slug: 'you-are-the-captain' }, { slug: 'one-settled-condition' }],
  content: ({ t }) => (
    <SlideFrame>
      <WaterlineEcho
        zones={zoneWordsFrom((key) => t(key))}
        rulerLabel={t('ruler')}
        robotAt="deck"
        section={0}
        tag={t('tag')}
        statement={t('aiStatement')}
        chat={t('analogy')}
        coding={t('agent')}
      />
    </SlideFrame>
  ),
});
