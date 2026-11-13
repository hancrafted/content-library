import { slide } from '@/episodes/components/slide-master/slide';
import { SlideBackdrop, SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ViewToggle } from '@/episodes/components/slide-shared/agent-view/view-toggle';
import { Character } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { Ship } from '@/episodes/components/slide-shared/deep-sea-expedition/ship';
import { shipAnchors } from '@/episodes/components/slide-shared/deep-sea-expedition/ship.pure';
import { DepthRuler } from '@/episodes/components/slide-shared/iceberg/depth-ruler';
import { ZoneCard } from '@/episodes/components/slide-shared/iceberg/zone-card';
import { SURFACE_WATERLINE, ZoneScene } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { WATERLINE_SECTIONS } from '@/episodes/components/slide-shared/waterline-echo/depth';
import de from './i18n/de.json';
import en from './i18n/en.json';

const SHIP_X = 600;
const ANCHORS = shipAnchors();
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
      transform={`translate(${SHIP_X} ${SURFACE_WATERLINE})`}
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
 * The Title slide's hero Scene (the record's `title`), the Hero motif of picked Option 0a: the research ship on the
 * waterline has lowered its diving robot from the A-frame to hang just above the water, and one pill marks it as the
 * Surface on the depth ruler. The shared header renders the `h1` and the Episode's caption above it; each section slide
 * echoes the scene one zone deeper (`slide-shared/waterline-echo/`). It also holds the page's one Chat app / Coding
 * agent switch, which every view line of the Episode follows.
 */
export const hero = slide({
  slug: 'hero',
  messages: { en, de },
  content: ({ t, locale }) => {
    const files = [
      { name: t('agent.files.skill.name'), role: t('agent.files.skill.role') },
      { name: t('agent.files.folders.name'), role: t('agent.files.folders.role') },
      { name: t('agent.files.project.name'), role: t('agent.files.project.role') },
    ];
    return (
      <>
        {/* The Title slide's one Backdrop, empty: the scene draws inside the frame. */}
        <SlideBackdrop mobile />
        <SlideFrame className="mt-10 flex flex-col gap-4">
          <ViewToggle
            labels={{ label: t('view.label'), chat: t('view.chat'), coding: t('view.coding') }}
            className="self-end"
          />
          <ZoneScene
            zone="surface"
            label={t('label')}
            className="aspect-[1200/820] min-h-96 w-full rounded-2xl"
            overlay={
              <>
                <DepthRuler
                  sections={WATERLINE_SECTIONS}
                  lit={0}
                  zones={(locale === 'de' ? de : en).zones}
                  label={t('ruler')}
                  descend={false}
                  className="absolute top-[30%] left-4 w-52 max-sm:hidden"
                />
                <p
                  data-you-are-here
                  className="absolute top-[52%] left-[46%] rounded-full bg-primary px-3 py-1 text-caption font-semibold text-primary-foreground shadow-md"
                >
                  {t('youAreHere')}
                </p>
                <InView view="coding" as="div" className="absolute right-6 bottom-6 w-80 max-sm:right-3 max-sm:w-64">
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
          </ZoneScene>
        </SlideFrame>
      </>
    );
  },
});
