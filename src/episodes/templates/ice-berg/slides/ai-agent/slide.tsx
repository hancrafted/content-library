import { slide } from '@/episodes/components/slide-master/slide';
import { Character } from '@/episodes/components/slide-shared/character/character';
import { POSES } from '@/episodes/components/slide-shared/character/poses.pure';
import { aiAgent as preset } from '@/episodes/components/slide-shared/character/shared-presets';
import { FigureGallery, Specimen } from '@/episodes/components/slide-shared/figure-gallery/figure-gallery';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const aiAgent = slide({
  slug: 'ai-agent',
  messages: { en, de },
  content: ({ t }) => (
    <FigureGallery
      item="ai-agent"
      intro={t('intro')}
      contract={t('contract')}
      labels={{ pause: t('pause'), resume: t('resume'), replay: t('replay') }}
    >
      {POSES.map((pose) => (
        <Specimen
          key={pose}
          variant={pose}
          label={t(`poses.${pose}`)}
          usage={t('usage')}
          code={`<Character preset={aiAgent} pose="${pose}" />`}
        >
          <Character preset={preset} pose={pose} />
        </Specimen>
      ))}
    </FigureGallery>
  ),
});
