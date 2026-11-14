import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { zoneWordsFrom } from '@/episodes/components/slide-shared/iceberg/zone-words.pure';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import { WaterlineEcho } from '@/episodes/components/slide-shared/waterline-echo/waterline-echo';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "What context stays beside", echoing the Hero motif (picked Title-slide Option 0a). The project file beside the card, in twilight: the depth lives in today's dive plan, not in the card.
export const whatStaysBeside = slide({
  slug: 'what-stays-beside',
  messages: { en, de },
  presentation: atDepth(5, 'section'),
  segments: [{ slug: 'beside-not-inside' }, { slug: 'where-it-gets-shared' }],
  content: ({ t }) => (
    <SlideFrame>
      <WaterlineEcho
        zones={zoneWordsFrom((key) => t(key))}
        rulerLabel={t('ruler')}
        section={5}
        wide
        tilt="right"
        statement={t('aiStatement')}
        chat={t('analogy')}
        coding={t('agent')}
        above={<p className="w-fit rounded-md bg-card px-2 text-caption text-card-foreground shadow-sm">{t('file')}</p>}
      >
        <ol className="mt-1 flex flex-col text-caption text-muted-foreground">
          <li>{t('sites.site4')}</li>
          <li>{t('sites.site7')}</li>
        </ol>
      </WaterlineEcho>
    </SlideFrame>
  ),
});
