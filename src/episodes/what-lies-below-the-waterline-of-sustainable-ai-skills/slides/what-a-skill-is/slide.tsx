import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { zoneWordsFrom } from '@/episodes/components/slide-shared/iceberg/zone-words.pure';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import { WaterlineEcho } from '@/episodes/components/slide-shared/waterline-echo/waterline-echo';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "What a skill is", echoing the Hero motif (picked Title-slide Option 0a). The robot over the water at the Surface, clear of the card: a skill is a name, a description and instructions.
export const whatASkillIs = slide({
  slug: 'what-a-skill-is',
  messages: { en, de },
  presentation: atDepth(1, 'section'),
  segments: [{ slug: 'surface-first' }, { slug: 'the-mechanics-plainly' }],
  content: ({ t }) => (
    <SlideFrame>
      <WaterlineEcho
        zones={zoneWordsFrom((key) => t(key))}
        rulerLabel={t('ruler')}
        section={1}
        statement={t('aiStatement')}
        chat={t('analogy')}
        coding={t('agent')}
      />
    </SlideFrame>
  ),
});
