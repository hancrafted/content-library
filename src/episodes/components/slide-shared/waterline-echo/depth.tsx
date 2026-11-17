import { zonePresentation, type ZonePresentation } from '../iceberg/zone-presentation';
import { zoneOf, type Zone } from '../iceberg/zones.pure';
import { EchoDrawing } from './echo-drawing';
import { robotAt } from './robot-story.pure';

/**
 * The zone each Section of "What lies below the waterline of sustainable AI skills" sits in, as the approved Spec
 * assigns them: Surface 1–2, Sunlit 3–4, Twilight 5–6, Midnight 7, Abyss 8. Shared because every Slide of the Episode
 * names its Section on the depth gauge and the rail.
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

const SECTION_TITLES: readonly string[] = [
  'a-thought-experiment',
  'what-a-skill-is',
  'when-to-write-one',
  'the-label',
  'what-goes-inside',
  'what-stays-beside',
  'sharing-it',
  'keeping-it-alive',
];

export function atDepth(section: number, kind: 'section' | 'page'): ZonePresentation {
  const scene =
    kind === 'section' ? (
      <EchoDrawing zone={zoneOf(WATERLINE_SECTIONS, section)} robot={robotAt(SECTION_TITLES[section] ?? '').state} />
    ) : undefined;
  return zonePresentation({ sections: WATERLINE_SECTIONS, section, kind, scene });
}
