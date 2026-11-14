import { slide } from '@/episodes/components/slide-master/slide';
import { FigureGallery, Specimen } from '@/episodes/components/slide-shared/figure-gallery/figure-gallery';
import { Clouds, SunMoon } from '@/episodes/components/slide-shared/iceberg/scenery/sky';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const sky = slide({
  slug: 'sky',
  messages: { en, de },
  content: ({ t }) => (
    <FigureGallery
      item="sky"
      intro={t('intro')}
      contract={t('contract')}
      labels={{ pause: t('pause'), resume: t('resume'), replay: t('replay') }}
    >
      <Specimen
        variant="theme"
        label={t('variants.theme')}
        usage={t('usage')}
        code="<SunMoon x={0} y={0} />"
        viewBox="-90 -70 180 140"
      >
        <SunMoon x={0} y={0} />
      </Specimen>
      <Specimen
        variant="moon"
        label={t('variants.moon')}
        usage={t('usage')}
        code={'<g className="dark"><SunMoon x={0} y={0} /></g>'}
        viewBox="-90 -70 180 140"
      >
        <g className="dark">
          <SunMoon x={0} y={0} />
        </g>
      </Specimen>
      <Specimen
        variant="clouds"
        label={t('variants.clouds')}
        usage={t('usage')}
        code="<Clouds />"
        viewBox="0 0 1200 430"
      >
        <Clouds />
      </Specimen>
    </FigureGallery>
  ),
});
