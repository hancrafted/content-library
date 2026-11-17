import { zonePresentation, type ZonePresentation } from '../iceberg/zone-presentation';
import { zoneOf, type Zone } from '../iceberg/zones.pure';
import { EchoDrawing } from './echo-drawing';
import { robotAt } from './robot-story.pure';

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
