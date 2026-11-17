import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { zoneWordsFrom } from '@/episodes/components/slide-shared/iceberg/zone-words.pure';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import { WaterlineEcho } from '@/episodes/components/slide-shared/waterline-echo/waterline-echo';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const aThoughtExperiment = slide({
  slug: 'a-thought-experiment',
  messages: { en, de },
  presentation: atDepth(0, 'section'),
  segments: [{ slug: 'you-are-the-captain' }, { slug: 'one-settled-condition' }],
  content: ({ t, template }) => (
    <SlideFrame>
      <WaterlineEcho
        zones={zoneWordsFrom((key) => t(key))}
        gaugeLabel={t('gauge')}
        place={template('place')}
        section={0}
        tag={t('tag')}
        statement={t('aiStatement')}
        chat={t('analogy')}
        coding={t('agent')}
      />
    </SlideFrame>
  ),
});
