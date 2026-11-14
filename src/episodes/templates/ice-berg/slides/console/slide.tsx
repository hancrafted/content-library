import { slide } from '@/episodes/components/slide-master/slide';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import { consoleLayout } from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import { FigureGallery, Specimen } from '@/episodes/components/slide-shared/figure-gallery/figure-gallery';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const console = slide({
  slug: 'console',
  messages: { en, de },
  content: ({ t }) => {
    const seat = consoleLayout({ width: 260, flip: true }).seat;
    return (
      <FigureGallery
        item="console"
        intro={t('intro')}
        contract={t('contract')}
        labels={{ pause: t('pause'), resume: t('resume'), replay: t('replay') }}
      >
        <Specimen
          variant="wide"
          label={t('variants.wide')}
          usage={t('usage')}
          code="<Console width={260} />"
          viewBox="-40 -70 350 170"
        >
          <Console width={260} />
        </Specimen>
        <Specimen
          variant="small"
          label={t('variants.small')}
          usage={t('usage')}
          code="<Console width={82} mugs={1} />"
          viewBox="-40 -70 350 170"
        >
          <Console width={82} mugs={1} />
        </Specimen>
        <Specimen
          variant="mugs"
          label={t('variants.mugs')}
          usage={t('usage')}
          code="<Console width={160} mugs={3} />"
          viewBox="-40 -70 350 170"
        >
          <Console width={160} mugs={3} />
        </Specimen>
        <Specimen
          variant="screen"
          label={t('variants.screen')}
          usage={t('usage')}
          code={
            '<Console width={260} screens={1}>\n  <rect width={80} height={10} className="fill-primary" />\n</Console>'
          }
          viewBox="-40 -70 350 170"
        >
          <Console width={260} screens={1}>
            <rect width={80} height={10} className="fill-primary" />
          </Console>
        </Specimen>
        <Specimen
          variant="flip"
          label={t('variants.flip')}
          usage={t('usage')}
          code={'const { seat } = consoleLayout({ width: 260, flip: true });\n<Console width={260} flip />'}
          viewBox="-330 -70 680 200"
        >
          <Console width={260} flip />
          <circle cx={seat.x} cy={seat.y} r={5} className="fill-primary" />
        </Specimen>
      </FigureGallery>
    );
  },
});
