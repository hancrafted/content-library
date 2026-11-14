import { slide } from '@/episodes/components/slide-master/slide';
import { FigureGallery, Specimen } from '@/episodes/components/slide-shared/figure-gallery/figure-gallery';
import { Bubbles, FishSchool, Jellies, Whale } from '@/episodes/components/slide-shared/iceberg/scenery/sea-life';
import { LightRays, Seabed } from '@/episodes/components/slide-shared/iceberg/scenery/seabed';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const seaLife = slide({
  slug: 'sea-life',
  messages: { en, de },
  content: ({ t }) => (
    <FigureGallery
      item="sea-life"
      intro={t('intro')}
      contract={t('contract')}
      labels={{ pause: t('pause'), resume: t('resume'), replay: t('replay') }}
    >
      <Specimen
        variant="school"
        label={t('variants.school')}
        usage={t('usage')}
        zone="sunlit"
        code="<FishSchool x={0} y={0} count={11} seed={1} />"
        viewBox="-180 -110 360 220"
      >
        <FishSchool x={0} y={0} />
      </Specimen>
      <Specimen
        variant="left"
        label={t('variants.left')}
        usage={t('usage')}
        zone="sunlit"
        code="<FishSchool x={0} y={0} count={5} seed={4} flip />"
        viewBox="-180 -110 360 220"
      >
        <FishSchool x={0} y={0} count={5} seed={4} flip />
      </Specimen>
      <Specimen
        variant="jellies"
        label={t('variants.jellies')}
        usage={t('usage')}
        zone="twilight"
        code="<Jellies x={0} y={0} />"
        viewBox="-100 -90 270 210"
      >
        <Jellies x={0} y={0} />
      </Specimen>
      <Specimen
        variant="whale"
        label={t('variants.whale')}
        usage={t('usage')}
        zone="midnight"
        code="<Whale x={0} y={0} />"
        viewBox="-120 -80 300 160"
      >
        <Whale x={0} y={0} />
      </Specimen>
      <Specimen
        variant="bubbles"
        label={t('variants.bubbles')}
        usage={t('usage')}
        zone="abyss"
        code="<Bubbles x={0} y={0} count={7} />"
        viewBox="-80 -150 160 300"
      >
        <Bubbles x={0} y={0} />
      </Specimen>
      <Specimen
        variant="seabed"
        label={t('variants.seabed')}
        usage={t('usage')}
        zone="abyss"
        code="<Seabed y={100} width={1200} />"
        viewBox="0 0 1200 300"
      >
        <Seabed y={100} />
      </Specimen>
      <Specimen
        variant="rays"
        label={t('variants.rays')}
        usage={t('usage')}
        zone="sunlit"
        code="<LightRays x={0} y={0} count={5} />"
        viewBox="-30 0 450 240"
      >
        <LightRays x={0} y={0} />
      </Specimen>
    </FigureGallery>
  ),
});
