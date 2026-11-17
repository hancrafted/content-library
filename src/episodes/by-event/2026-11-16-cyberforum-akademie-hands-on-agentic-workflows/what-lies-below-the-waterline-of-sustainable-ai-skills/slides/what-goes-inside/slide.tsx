import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { zoneWordsFrom } from '@/episodes/components/slide-shared/iceberg/zone-words.pure';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import { WaterlineEcho } from '@/episodes/components/slide-shared/waterline-echo/waterline-echo';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const whatGoesInside = slide({
  slug: 'what-goes-inside',
  messages: { en, de },
  presentation: atDepth(4, 'section'),
  segments: [{ slug: 'twilight' }, { slug: 'a-decision-not-a-law' }],
  content: ({ t, template }) => (
    <SlideFrame>
      <WaterlineEcho
        zones={zoneWordsFrom((key) => t(key))}
        gaugeLabel={t('gauge')}
        place={template('place')}
        section={4}
        wide
        statement={t('aiStatement')}
        chat={t('analogy')}
        coding={t('agent')}
      >
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="rounded-full bg-primary px-2 text-caption text-primary-foreground">
            {t('extras.armPreset')}
          </span>
          <span className="rounded-full border border-border px-2 text-caption">{t('extras.speciesGuide')}</span>
        </div>
      </WaterlineEcho>
    </SlideFrame>
  ),
});
