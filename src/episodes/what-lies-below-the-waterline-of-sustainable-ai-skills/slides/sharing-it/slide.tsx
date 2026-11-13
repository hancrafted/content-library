import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { zoneWordsFrom } from '@/episodes/components/slide-shared/iceberg/zone-words.pure';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import { WaterlineEcho } from '@/episodes/components/slide-shared/waterline-echo/waterline-echo';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "Sharing it", echoing the Hero motif (picked Title-slide Option 0a). The owner band, at Midnight: the card in the institute's fleet manual.
export const sharingIt = slide({
  slug: 'sharing-it',
  messages: { en, de },
  presentation: atDepth(6, 'section'),
  segments: [{ slug: 'midnight' }, { slug: 'three-jobs' }],
  content: ({ t }) => (
    <SlideFrame>
      <WaterlineEcho
        zones={zoneWordsFrom((key) => t(key))}
        rulerLabel={t('ruler')}
        robotAt="hanging"
        section={6}
        wide
        statement={t('aiStatement')}
        chat={t('analogy')}
        coding={t('agent')}
      >
        <p className="mt-2 w-fit rounded-md bg-foreground px-2 text-caption font-semibold text-background">
          {t('owner')}
        </p>
      </WaterlineEcho>
    </SlideFrame>
  ),
});
