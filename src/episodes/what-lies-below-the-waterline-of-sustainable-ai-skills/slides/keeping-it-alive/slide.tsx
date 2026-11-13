import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { WaterlineEcho } from '@/episodes/components/slide-shared/waterline-echo/waterline-echo';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "Keeping it alive", echoing the Hero motif (picked Title-slide Option 0a). The running tag, in the Abyss, the robot on the seabed: keeping a skill right costs something every month.
export const keepingItAlive = slide({
  slug: 'keeping-it-alive',
  messages: { en, de },
  segments: [{ slug: 'the-abyss' }, { slug: 'nobody-sees-it' }],
  content: ({ t }) => (
    <SlideFrame>
      <WaterlineEcho
        zone="abyss"
        zoneLabel={t('zone')}
        robotAt="seabed"
        section={7}
        wide
        statement={t('aiStatement')}
        chat={t('analogy')}
        coding={t('agent')}
      >
        <ol className="mt-2 flex flex-col gap-0.5 font-mono text-caption">
          <li>{t('entries.details')}</li>
          <li>{t('entries.tool')}</li>
          <li>{t('entries.overlap')}</li>
        </ol>
      </WaterlineEcho>
    </SlideFrame>
  ),
});
