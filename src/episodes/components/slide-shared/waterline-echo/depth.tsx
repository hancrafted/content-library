import { zoneOf, type Zone } from '../iceberg/ruler.pure';
import { zonePresentation, type ZonePresentation } from '../iceberg/zone-presentation';
import { EchoDrawing, type RobotAt } from './echo-drawing';

/**
 * The zone each Section of "What lies below the waterline of sustainable AI skills" sits in, as the approved Spec
 * assigns them: Surface 1–2, Sunlit 3–4, Twilight 5–6, Midnight 7, Abyss 8. Shared because every Slide of the Episode
 * names its Section on the ruler and the rail.
 */
export const WATERLINE_SECTIONS: readonly Zone[] = [
  'surface',
  'surface',
  'sunlit',
  'sunlit',
  'twilight',
  'twilight',
  'midnight',
  'abyss',
];

/** Where each Section's section slide finds the robot: on deck, just over the water, on its cable, then on the seabed. */
const ROBOT_AT: readonly RobotAt[] = [
  'deck',
  'surface',
  'hanging',
  'hanging',
  'hanging',
  'hanging',
  'hanging',
  'seabed',
];

/**
 * A Slide's `presentation` at its Section's depth: `presentation: atDepth(4, 'page')`. A section slide descends
 * through bubbles into its zone's drawing, laid full-bleed behind it with the robot at the Section's depth, and a page
 * Slide carries the rail with its Section lit; the surface stays the page's own while zone backgrounds are paused.
 */
export function atDepth(section: number, kind: 'section' | 'page'): ZonePresentation {
  const scene =
    kind === 'section' ? (
      <EchoDrawing zone={zoneOf(WATERLINE_SECTIONS, section)} robotAt={ROBOT_AT[section] ?? 'hanging'} />
    ) : undefined;
  return zonePresentation({ sections: WATERLINE_SECTIONS, section, kind, scene });
}
