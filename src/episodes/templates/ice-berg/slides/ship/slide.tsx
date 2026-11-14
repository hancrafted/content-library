import { slide } from '@/episodes/components/slide-master/slide';
import { Character } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { Ship } from '@/episodes/components/slide-shared/deep-sea-expedition/ship';
import { shipAnchors } from '@/episodes/components/slide-shared/deep-sea-expedition/ship.pure';
import { FigureGallery, Specimen } from '@/episodes/components/slide-shared/figure-gallery/figure-gallery';
import de from './i18n/de.json';
import en from './i18n/en.json';

function AnchorMarks({ flip = false }: { readonly flip?: boolean }) {
  const anchors = shipAnchors(flip);
  const points = [
    anchors.bridge.captain,
    anchors.bridge.pilot,
    anchors.deck.aft,
    anchors.deck.fore,
    anchors.robot,
    anchors.aFrameTip,
  ];
  return (
    <g data-anchor-marks>
      {points.map(({ x, y }, index) => (
        <circle key={index} cx={x} cy={y} r={4} className="fill-primary stroke-card" strokeWidth={1.5} />
      ))}
    </g>
  );
}

function CrewedShip() {
  const { bridge, deck, robot } = shipAnchors();
  return (
    <Ship
      bridge={
        <>
          <g transform={`translate(${bridge.captain.x} ${bridge.captain.y}) scale(.3)`}>
            <Character preset={captain} />
          </g>
          <g transform={`translate(${bridge.pilot.x} ${bridge.pilot.y}) scale(.3)`}>
            <Character preset={pilot} />
          </g>
        </>
      }
      deck={
        <>
          <g transform={`translate(${deck.fore.x} ${deck.fore.y}) scale(.55)`}>
            <Character preset={captain} pose="point" />
          </g>
          <g transform={`translate(${robot.x} ${robot.y - 32}) scale(.5)`}>
            <Robot lamp={false} />
          </g>
        </>
      }
    />
  );
}

export const ship = slide({
  slug: 'ship',
  messages: { en, de },
  content: ({ t }) => (
    <FigureGallery
      item="ship"
      intro={t('intro')}
      contract={t('contract')}
      labels={{ pause: t('pause'), resume: t('resume'), replay: t('replay') }}
    >
      <Specimen
        variant="rest"
        label={t('variants.rest')}
        usage={t('usage')}
        code="<Ship />"
        viewBox="-190 -210 380 270"
      >
        <Ship />
      </Specimen>
      <Specimen
        variant="anchors"
        label={t('variants.anchors')}
        usage={t('usage')}
        code={'const anchors = shipAnchors();\n<Ship />'}
        viewBox="-190 -210 380 270"
      >
        <Ship />
        <AnchorMarks />
      </Specimen>
      <Specimen
        variant="crew"
        label={t('variants.crew')}
        usage={t('usage')}
        code={'const { bridge, deck } = shipAnchors();\n<Ship bridge={bridgeFigures} deck={deckFigures} />'}
        viewBox="-190 -210 380 270"
      >
        <CrewedShip />
      </Specimen>
      <Specimen
        variant="flip"
        label={t('variants.flip')}
        usage={t('usage')}
        code={'const anchors = shipAnchors(true);\n<Ship flip />'}
        viewBox="-190 -210 380 270"
      >
        <Ship flip />
        <AnchorMarks flip />
      </Specimen>
      <Specimen
        variant="rock"
        label={t('variants.rock')}
        usage={t('usage')}
        code="<Ship rock />"
        viewBox="-190 -210 380 270"
      >
        <Ship rock />
      </Specimen>
    </FigureGallery>
  ),
});
