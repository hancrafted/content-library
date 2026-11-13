import type { Zone } from '../iceberg/ruler.pure';
import { zonePresentation, type ZonePresentation } from '../iceberg/zone-presentation';

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

/**
 * A Slide's `presentation` at its Section's depth: `presentation: atDepth(4, 'page')`. The zone colours the surface,
 * a section slide descends through bubbles, and a page Slide carries the rail with its Section lit.
 */
export function atDepth(section: number, kind: 'section' | 'page'): ZonePresentation {
  return zonePresentation({ sections: WATERLINE_SECTIONS, section, kind });
}
