import { slide } from '@/episodes/components/slide-master/slide';
import { SlideBackdrop, SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ViewToggle } from '@/episodes/components/slide-shared/agent-view/view-toggle';
import { Character } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { Ship } from '@/episodes/components/slide-shared/deep-sea-expedition/ship';
import { shipAnchors } from '@/episodes/components/slide-shared/deep-sea-expedition/ship.pure';
import { HeroDepthScene } from '@/episodes/components/slide-shared/iceberg/hero-depth-scene';
import { HERO_DEPTH } from '@/episodes/components/slide-shared/iceberg/hero-depth.pure';
import { ZoneCard } from '@/episodes/components/slide-shared/iceberg/zone-card';
import { zoneWordsFrom } from '@/episodes/components/slide-shared/iceberg/zone-words.pure';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** The ship right of centre, clear of the title on the left and of the iceberg on the right. */
const SHIP_X = 700;
const { waterline: WATERLINE } = HERO_DEPTH;
const ANCHORS = shipAnchors();
/** The pill hangs just under the water below the robot, as the Spec's mock sets it. */
const MARKER = { x: SHIP_X + ANCHORS.aFrameTip.x, y: WATERLINE + 36 };
/** The robot hangs from the A-frame just above the water, its lamp shining down. */
const ROBOT_HANG = -56;
/** The crew at the ship's scale, seen through the bridge windows. */
const CREW_SCALE = 0.42;

/** The research ship on the waterline, the crew on its bridge, the robot lowered on its cable from the A-frame. */
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
            <Robot aim="down" />
          </g>
        </>
      }
    />
  );
}

/**
 * The Title slide's hero Scene (the record's `title`), the Hero motif of picked Option 0a, full screen (Han's feedback
 * 1): the whole depth is one drawing in the Slide's Backdrop, edge to edge and under the hidden table of contents, so
 * the shared header's `h1` and lede sit in its sky. The research ship on the waterline has lowered its diving robot
 * from the A-frame to hang just above the water, the ruler down the left names the zones with the Surface lit, and one
 * pill marks the robot as the Surface. Each section slide echoes the scene one zone deeper
 * (`slide-shared/waterline-echo/`). It also holds the page's one Chat app / Coding agent switch, which every view line
 * of the Episode follows.
 */
export const hero = slide({
  slug: 'hero',
  messages: { en, de },
  content: ({ t }) => {
    const files = [
      { name: t('agent.files.skill.name'), role: t('agent.files.skill.role') },
      { name: t('agent.files.folders.name'), role: t('agent.files.folders.role') },
      { name: t('agent.files.project.name'), role: t('agent.files.project.role') },
    ];
    return (
      // The frame takes the Slide's free height, so the shared header sits at the top, in the sky.
      <SlideFrame className="flex-1">
        <HeroDepthScene
          layers={{ Backdrop: SlideBackdrop }}
          label={t('label')}
          zones={zoneWordsFrom((key) => t(key))}
          rulerLabel={t('ruler')}
          marker={{ text: t('youAreHere'), ...MARKER }}
          overlay={
            <>
              <ViewToggle
                labels={{ label: t('view.label'), chat: t('view.chat'), coding: t('view.coding') }}
                className="absolute top-4 right-(--inset-r)"
              />
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
      </SlideFrame>
    );
  },
});
