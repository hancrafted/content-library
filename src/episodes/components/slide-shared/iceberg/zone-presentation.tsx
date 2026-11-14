import type { ReactNode } from 'react';
import { DepthRail } from './depth-rail';
import { isDarkZone, zoneOf, zoneToken, type Zone } from './ruler.pure';

export interface ZonePresentationInput {
  /** The zone each of the Episode's Sections sits in, in order. */
  readonly sections: readonly Zone[];
  /** The Section the Slide belongs to, from 0. */
  readonly section: number;
  /** A section slide descends into its zone through bubbles and shows the depth gauge; a page Slide carries the rail. */
  readonly kind: 'section' | 'page';
  /** A section slide's drawing, laid full-bleed behind it as its rear decoration, under the rail; a page Slide has none. */
  readonly scene?: ReactNode;
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

/** Which kind of Slide an Iceberg presentation is for: the Title slide, a section slide or a page Slide. */
type SlideKind = 'title' | ZonePresentationInput['kind'];

/**
 * Whether a Slide takes its zone's colour as its background, by kind (Han, 2026-11-14; design guide, Iceberg): the
 * Title slide and the section slides fill with their zone, a page Slide keeps the page's own light or dark background
 * and marks depth only on its rail and in its scenery. The one seam that turns zone backgrounds on or off per kind.
 */
const ZONE_BACKGROUNDS: Readonly<Record<SlideKind, boolean>> = { title: true, section: true, page: false };

/** Text on a zone, the same in both themes as the zone palette is: the Abyss ink on a light zone, white on a dark one. */
function zoneText(zone: Zone): ZoneStyle {
  const ink = isDarkZone(zone) ? 'var(--on-brand-accent)' : zoneToken('abyss');
  return {
    '--slide-surface-foreground': ink,
    '--foreground': ink,
    '--muted-foreground': `color-mix(in oklab, ${ink} 78%, transparent)`,
  };
}

/**
 * The zone's colour over the whole surface, with its text, where the kind takes zone backgrounds; none on the others.
 * A section slide also lands with its zone under the floating page header, not below it: no anchor offset, and its
 * header's height as reading space before its words (docs/features/slide-transitions.md).
 */
function zoneSurface(zone: Zone, kind: SlideKind): ZoneStyle {
  if (!ZONE_BACKGROUNDS[kind]) return {};
  const landing: ZoneStyle =
    kind === 'section' ? { '--slide-anchor-offset': '0px', '--slide-space-before': 'var(--header-block)' } : {};
  return { '--slide-surface': zoneToken(zone), ...zoneText(zone), ...landing };
}

/**
 * The Title slide's presentation in the Iceberg style: the Surface's colour over its whole surface, its text dark in
 * both themes. A Title that declares its own surface runs up under the page header, so no band of page background
 * shows above it. Its hero drawing and depth gauge stay in its Scene: `presentation: zoneTitlePresentation()`.
 */
export function zoneTitlePresentation(): { readonly style: ZoneStyle } {
  return { style: zoneSurface('surface', 'title') };
}

/**
 * A Slide's place in the Iceberg style (design guide, Iceberg): its surface from `zoneSurface`, the one `--zone-<zone>`
 * token on a section slide, the page's own background on a page Slide. A page Slide carries the
 * slim rail at its left edge, its Section lit. A section slide descends into the zone through the `bubbles` ink and
 * shows the depth gauge, so its rail shows on phones only, where the gauge is hidden; its `scene` fills it from edge to
 * edge behind its words, like the Title slide's hero. A Slide names its Section, never
 * a colour: `presentation: zonePresentation({ sections, section: 4, kind: 'page' })`.
 */
export function zonePresentation({ sections, section, kind, scene }: ZonePresentationInput): ZonePresentation {
  const zone = zoneOf(sections, section);
  const rail = <DepthRail sections={sections} lit={section} phoneOnly={kind === 'section'} />;
  if (kind === 'page') return { style: zoneSurface(zone, kind), rear: rail, rearMobile: true };
  return {
    style: zoneSurface(zone, kind),
    enter: { effect: 'bubbles', style: { '--slide-transition-bubble': zoneToken(zone) } },
    rear: (
      <>
        {scene}
        {rail}
      </>
    ),
    rearMobile: true,
  };
}
