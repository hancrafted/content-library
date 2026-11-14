import type { ReactNode } from 'react';
import { DepthRail } from './depth-ruler';
import { isDarkZone, zoneOf, zoneToken, type Zone } from './ruler.pure';

export interface ZonePresentationInput {
  /** The zone each of the Episode's Sections sits in, in order. */
  readonly sections: readonly Zone[];
  /** The Section the Slide belongs to, from 0. */
  readonly section: number;
  /** A section slide descends into its zone through bubbles and shows the whole ruler; a page Slide carries the rail. */
  readonly kind: 'section' | 'page';
}

/** The Slide's surface and text in its zone; plain custom properties, as `presentation.style` takes. */
export type ZoneStyle = Readonly<Record<`--${string}`, string>> & { readonly '--slide-surface'?: string };

/** What a Slide passes as its `presentation` (design-ADR 0022's optional configuration), built from its zone alone. */
export interface ZonePresentation {
  readonly style: ZoneStyle;
  /** The descent's bubbles, tinted by the zone the section slide descends into: depth marked in scenery, not surface. */
  readonly enter?: {
    readonly effect: 'bubbles';
    readonly style: Readonly<Record<'--slide-transition-bubble', string>>;
  };
  readonly rear: ReactNode;
  /** The rail reads on phones too: there it is the only depth mark (design guide, Iceberg). */
  readonly rearMobile: true;
}

/**
 * Whether a Slide takes its zone's colour as its background. Paused (Han, 2026-11-14; design guide, Iceberg): every
 * Slide keeps the page's own light or dark background, and the zone colours mark depth only on the ruler, the rail
 * and the scenery. The one seam that brings zone backgrounds back: set it to `true`.
 */
const ZONE_BACKGROUNDS = false;

const LIGHT_TEXT: Readonly<Record<`--${string}`, string>> = {
  '--slide-surface-foreground': 'var(--on-brand-accent)',
  '--foreground': 'var(--on-brand-accent)',
  '--muted-foreground': 'color-mix(in oklab, var(--on-brand-accent) 78%, transparent)',
};

/** The zone's colour over the whole surface, its text light where the zone is dark in both themes; none while paused. */
function zoneSurface(zone: Zone): ZoneStyle {
  if (!ZONE_BACKGROUNDS) return {};
  return { '--slide-surface': zoneToken(zone), ...(isDarkZone(zone) ? LIGHT_TEXT : {}) };
}

/**
 * A Slide's place in the Iceberg style (design guide, Iceberg): its surface from `zoneSurface`, which keeps the page's
 * own background while zone backgrounds are paused, the one `--zone-<zone>` token once they return. A page Slide carries the
 * slim rail at its left edge, its Section lit. A section slide descends into the zone through the `bubbles` ink and
 * shows the whole ruler, so its rail shows on phones only, where the ruler is hidden. A Slide names its Section, never
 * a colour: `presentation: zonePresentation({ sections, section: 4, kind: 'page' })`.
 */
export function zonePresentation({ sections, section, kind }: ZonePresentationInput): ZonePresentation {
  const zone = zoneOf(sections, section);
  const style = zoneSurface(zone);
  const rear = <DepthRail sections={sections} lit={section} phoneOnly={kind === 'section'} />;
  return kind === 'section'
    ? {
        style,
        enter: { effect: 'bubbles', style: { '--slide-transition-bubble': zoneToken(zone) } },
        rear,
        rearMobile: true,
      }
    : { style, rear, rearMobile: true };
}
