import { slide } from '@/episodes/components/slide-master/slide';
import { SlideBackdrop } from '@/episodes/components/slide-master/slide-master';
import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { Character } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { Ship } from '@/episodes/components/slide-shared/deep-sea-expedition/ship';
import { shipAnchors } from '@/episodes/components/slide-shared/deep-sea-expedition/ship.pure';
import { HeroDepthScene } from '@/episodes/components/slide-shared/iceberg/hero-depth-scene';
import { HERO_DEPTH } from '@/episodes/components/slide-shared/iceberg/hero-depth.pure';
import { ZoneCard } from '@/episodes/components/slide-shared/iceberg/zone-card';
import { zoneTitlePresentation } from '@/episodes/components/slide-shared/iceberg/zone-presentation';
import { zoneWordsFrom } from '@/episodes/components/slide-shared/iceberg/zone-words.pure';
import { robotAt } from '@/episodes/components/slide-shared/waterline-echo/robot-story.pure';
import de from './i18n/de.json';
import en from './i18n/en.json';

const SHIP_X = 700;
const { waterline: WATERLINE } = HERO_DEPTH;
const ANCHORS = shipAnchors();
const MARKER = { x: SHIP_X + ANCHORS.aFrameTip.x, y: WATERLINE + 36 };
const ROBOT_HANG = -56;
const CREW_SCALE = 0.42;

function HeaderSpacer() {
  return <div aria-hidden="true" data-hero-room className="flex-1" />;
}

function Dive() {
  const { aFrameTip, bridge } = ANCHORS;
  return (
    <Ship
      rock
      transform={`translate(${SHIP_X} ${WATERLINE})`}
      bridge={
        <>
          <g transform={`translate(${bridge.captain.x} ${bridge.captain.y}) scale(${CREW_SCALE})`}>
            <Character preset={captain} pose="stand" />
          </g>
          <g transform={`translate(${bridge.pilot.x} ${bridge.pilot.y}) scale(${CREW_SCALE})`}>
            <Character preset={pilot} pose="steer" />
          </g>
        </>
      }
      deck={
        <>
          <line
            x1={aFrameTip.x}
            y1={aFrameTip.y}
            x2={aFrameTip.x}
            y2={ROBOT_HANG}
            strokeWidth={2}
            className="stroke-muted-foreground"
          />
          <g transform={`translate(${aFrameTip.x} ${ROBOT_HANG}) scale(0.9)`}>
            <Robot state={robotAt('hero').state} aim="down" />
          </g>
        </>
      }
    />
  );
}

export const hero = slide({
  slug: 'hero',
  messages: { en, de },
  presentation: zoneTitlePresentation(),
  content: ({ t }) => {
    const files = [
      { name: t('agent.files.skill.name'), role: t('agent.files.skill.role') },
      { name: t('agent.files.folders.name'), role: t('agent.files.folders.role') },
      { name: t('agent.files.project.name'), role: t('agent.files.project.role') },
    ];
    return (
      <>
        <HeaderSpacer />
        <HeroDepthScene
          layers={{ Backdrop: SlideBackdrop }}
          label={t('label')}
          zones={zoneWordsFrom((key) => t(key))}
          gaugeLabel={t('gauge')}
          marker={{ text: t('youAreHere'), ...MARKER }}
          overlay={
            <>
              <InView view="coding" as="div" className="absolute right-(--inset-r) bottom-6 w-80 max-sm:w-64">
                <ZoneCard className="rounded-xl p-4 shadow-md">
                  <p className="text-caption font-semibold text-primary uppercase">{t('agent.heading')}</p>
                  <ul className="mt-2 flex flex-col gap-2 text-caption">
                    {files.map(({ name, role }) => (
                      <li key={name} className="flex flex-col">
                        <span data-file-name className="font-mono font-semibold">
                          {name}
                        </span>
                        <span className="text-muted-foreground">{role}</span>
                      </li>
                    ))}
                  </ul>
                </ZoneCard>
              </InView>
            </>
          }
        >
          <Dive />
        </HeroDepthScene>
      </>
    );
  },
});
