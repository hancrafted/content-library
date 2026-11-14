import { slide } from '@/episodes/components/slide-master/slide';
import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { FigureGallery, Specimen } from '@/episodes/components/slide-shared/figure-gallery/figure-gallery';
import de from './i18n/de.json';
import en from './i18n/en.json';

const VARIANTS = [
  { id: 'rest', props: {}, code: '<Robot />' },
  { id: 'beamOn', props: { motion: 'beam-on' }, code: '<Robot motion="beam-on" />' },
  { id: 'scan', props: { motion: 'scan' }, code: '<Robot motion="scan" />' },
  { id: 'dive', props: { motion: 'dive' }, code: '<Robot motion="dive" />' },
  { id: 'surface', props: { motion: 'surface' }, code: '<Robot motion="surface" />' },
  { id: 'lampOff', props: { lamp: false }, code: '<Robot lamp={false} />' },
  { id: 'aimDown', props: { aim: 'down' }, code: '<Robot aim="down" />' },
] as const;

export const robot = slide({
  slug: 'robot',
  messages: { en, de },
  notes: [{ slug: 'coordinates', target: 'robot' }],
  content: ({ t, target }) => (
    <div {...target('robot')}>
      <FigureGallery
        item="robot"
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
            viewBox="-100 -85 360 210"
            zone="twilight"
          >
            <Robot {...props} />
          </Specimen>
        ))}
      </FigureGallery>
    </div>
  ),
});
