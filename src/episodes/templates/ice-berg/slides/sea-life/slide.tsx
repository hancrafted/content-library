import { slide } from '@/episodes/components/slide-master/slide';
import { FigureGallery, Specimen } from '@/episodes/components/slide-shared/figure-gallery/figure-gallery';
import { FishSchool } from '@/episodes/components/slide-shared/iceberg/scenery/fish-school';
import { Jellies } from '@/episodes/components/slide-shared/iceberg/scenery/jellies';
import { Lanternfish } from '@/episodes/components/slide-shared/iceberg/scenery/lanternfish';
import { Bubbles } from '@/episodes/components/slide-shared/iceberg/scenery/sea-life';
import { LightRays, Seabed } from '@/episodes/components/slide-shared/iceberg/scenery/seabed';
import { Siphonophore } from '@/episodes/components/slide-shared/iceberg/scenery/siphonophore';
import { Whale } from '@/episodes/components/slide-shared/iceberg/scenery/whale';
import { PolyBubble } from '@/shared/components/core-components/poly-bubble/poly-bubble';
import de from './i18n/de.json';
import en from './i18n/en.json';

/*
 * The sea life in the gallery, to judge each creature on its own before it meets a Slide. `PolyBubble`
 * (src/shared/components/core-components/poly-bubble/) is the one faceted bubble both the Abyss bubbles and the `bubbles` transition
 * draw, so it stands here on its own at each of its three outlines.
 */
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
        variant="lanternfish"
        label={t('variants.lanternfish')}
        usage={t('usage')}
        zone="twilight"
        code="<Lanternfish x={0} y={0} count={9} seed={3} />"
        viewBox="-180 -110 360 220"
      >
        <Lanternfish x={0} y={0} />
      </Specimen>
      <Specimen
        variant="siphonophore"
        label={t('variants.siphonophore')}
        usage={t('usage')}
        zone="twilight"
        code="<Siphonophore x={0} y={-110} segments={9} />"
        viewBox="-120 -125 240 250"
      >
        <Siphonophore x={0} y={-110} />
      </Specimen>
      <Specimen
        variant="whale"
        label={t('variants.whale')}
        usage={t('usage')}
        zone="midnight"
        code="<Whale x={0} y={0} />"
        viewBox="-220 -100 440 220"
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
        variant="poly-bubble"
        label={t('variants.polyBubble')}
        usage={t('usage')}
        zone="abyss"
        code="<PolyBubble sides={7} x={-40} y={-40} size={80} />"
        viewBox="-150 -60 300 120"
      >
        <PolyBubble sides={6} x={-140} y={-40} size={80} />
        <PolyBubble sides={7} x={-40} y={-40} size={80} />
        <PolyBubble sides={8} x={60} y={-40} size={80} />
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
