import { slide } from '@/episodes/components/slide-master/slide';
import { Character } from '@/episodes/components/slide-shared/character/character';
import { MOTIONS, POSES } from '@/episodes/components/slide-shared/character/poses.pure';
import { captain as preset } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { FigureGallery, Specimen } from '@/episodes/components/slide-shared/figure-gallery/figure-gallery';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const captain = slide({
  slug: 'captain',
  messages: { en, de },
  content: ({ t }) => (
    <FigureGallery
      item="captain"
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
          code={`<Character preset={captain} pose="${pose}" />`}
        >
          <Character preset={preset} pose={pose} />
        </Specimen>
      ))}
      {MOTIONS.map((motion) => (
        <Specimen
          key={motion}
          variant={motion}
          label={t(`motions.${motion}`)}
          usage={t('usage')}
          code={`<Character preset={captain} motion="${motion}" mood="happy" />`}
        >
          <Character preset={preset} motion={motion} mood="happy" />
        </Specimen>
      ))}
    </FigureGallery>
  ),
});
