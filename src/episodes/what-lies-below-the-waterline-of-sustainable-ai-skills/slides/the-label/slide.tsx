import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { zoneWordsFrom } from '@/episodes/components/slide-shared/iceberg/zone-words.pure';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import { WaterlineEcho } from '@/episodes/components/slide-shared/waterline-echo/waterline-echo';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "The description", echoing the Hero motif (picked Title-slide Option 0a). The description line, deeper in sunlight: the lamp's beam falls on it.
export const theLabel = slide({
  slug: 'the-label',
  messages: { en, de },
  presentation: atDepth(3, 'section'),
  segments: [{ slug: 'the-label-decides' }, { slug: 'name-description' }],
  content: ({ t }) => (
    <SlideFrame>
      <WaterlineEcho
        zones={zoneWordsFrom((key) => t(key))}
        rulerLabel={t('ruler')}
        robotAt="hanging"
        section={3}
        wide
        tilt="right"
        statement={t('aiStatement')}
        chat={t('analogy')}
        coding={t('agent')}
      >
        <p className="mt-2 border-l-4 border-primary pl-2 text-caption">{t('description')}</p>
      </WaterlineEcho>
    </SlideFrame>
  ),
});
