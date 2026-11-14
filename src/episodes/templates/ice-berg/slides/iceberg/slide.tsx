import { slide } from '@/episodes/components/slide-master/slide';
import { FigureGallery, Specimen } from '@/episodes/components/slide-shared/figure-gallery/figure-gallery';
import { Iceberg } from '@/episodes/components/slide-shared/iceberg/scenery/iceberg';
import { depthScaleForKeel } from '@/episodes/components/slide-shared/iceberg/scenery/scenery.pure';
import de from './i18n/de.json';
import en from './i18n/en.json';

const VARIANTS = [
  { id: 'whole', props: {}, code: '<Iceberg x={600} waterline={400} />' },
  { id: 'narrow', props: { scale: 0.55 }, code: '<Iceberg x={600} waterline={400} scale={0.55} />' },
  {
    id: 'depth',
    props: { depthScale: depthScaleForKeel(400, 575) },
    code: '<Iceberg x={600} waterline={400}\n  depthScale={depthScaleForKeel(400, 575)} />',
  },
  { id: 'tip', props: { part: 'tip' }, code: '<Iceberg part="tip" x={600} waterline={400} />' },
  {
    id: 'keel',
    props: { part: 'keel', depthScale: 1.4 },
    code: '<Iceberg part="keel" x={600} waterline={400} depthScale={1.4} />',
  },
] as const;

export const iceberg = slide({
  slug: 'iceberg',
  messages: { en, de },
  content: ({ t }) => (
    <FigureGallery
      item="iceberg"
      intro={t('intro')}
      contract={t('contract')}
      labels={{ pause: t('pause'), resume: t('resume'), replay: t('replay') }}
    >
      {VARIANTS.map(({ id, props, code }) => (
        <Specimen
          key={id}
          variant={id}
          label={t(`variants.${id}`)}
          usage={t('usage')}
          code={code}
          viewBox="250 150 700 1250"
          zone="sunlit"
        >
          <Iceberg x={600} waterline={400} {...props} />
          <line
            x1={250}
            x2={950}
            y1={400}
            y2={400}
            className="stroke-muted-foreground"
            strokeDasharray="10 10"
            strokeWidth={2}
          />
        </Specimen>
      ))}
    </FigureGallery>
  ),
});
