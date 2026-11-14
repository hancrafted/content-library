import { Character } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { Ship } from '@/episodes/components/slide-shared/deep-sea-expedition/ship';
import { shipAnchors } from '@/episodes/components/slide-shared/deep-sea-expedition/ship.pure';
import { Travel } from '@/episodes/components/slide-shared/iceberg/travel';
import { SURFACE_WATERLINE, ZoneScene } from '@/episodes/components/slide-shared/iceberg/zone-scene';

const SHIP_X = 560;
const ANCHORS = shipAnchors();
/** The rows of water come after the Surface, five of them, so the robot rises the whole Scene's depth and more. */
const RISE_DELAY_MS = 1800;
/** The crew at the ship's scale, seen through the bridge windows. */
const CREW_SCALE = 0.42;

/**
 * The Surface at the top of the whole iceberg (Option 26a): the ship at the waterline with the captain and the pilot
 * on the bridge, the robot rising back onto its deck, and the iceberg whole. Its sky is cropped to the band around
 * the waterline by the box the Slide gives it.
 */
export function DeckScene({ label }: { readonly label: string }) {
  return (
    <ZoneScene zone="surface" iceberg="whole" label={label} className="-mt-[12.5%] aspect-[3/2] w-full">
      <Ship
        transform={`translate(${SHIP_X} ${SURFACE_WATERLINE})`}
        bridge={
          <>
            <g transform={`translate(${ANCHORS.bridge.captain.x} ${ANCHORS.bridge.captain.y}) scale(${CREW_SCALE})`}>
              <Character preset={captain} />
            </g>
            <g transform={`translate(${ANCHORS.bridge.pilot.x} ${ANCHORS.bridge.pilot.y}) scale(${CREW_SCALE})`}>
              <Character preset={pilot} pose="steer" />
            </g>
          </>
        }
        deck={
          <Travel from="0 50%" duration={1400} delay={RISE_DELAY_MS}>
            <g transform={`translate(${ANCHORS.robot.x} ${ANCHORS.robot.y - 60}) scale(0.8)`}>
              <Robot lamp={false} />
            </g>
          </Travel>
        }
      />
    </ZoneScene>
  );
}
