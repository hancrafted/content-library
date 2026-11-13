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
export type ZoneStyle = Readonly<Record<`--${string}`, string>> & { readonly '--slide-surface': string };

/** What a Slide passes as its `presentation` (design-ADR 0022's optional configuration), built from its zone alone. */
export interface ZonePresentation {
  readonly style: ZoneStyle;
  readonly enter?: { readonly effect: 'bubbles' };
  readonly rear: ReactNode;
  /** The rail reads on phones too: there it is the only depth mark (design guide, Iceberg). */
  readonly rearMobile: true;
}

const LIGHT_TEXT: Readonly<Record<`--${string}`, string>> = {
  '--slide-surface-foreground': 'var(--on-brand-accent)',
  '--foreground': 'var(--on-brand-accent)',
  '--muted-foreground': 'color-mix(in oklab, var(--on-brand-accent) 78%, transparent)',
};

/**
 * A Slide's place in the Iceberg style (design guide, Iceberg): its Section's zone colours its whole surface, from the
 * one `--zone-<zone>` token, and turns its text light where the zone is dark in both themes. A page Slide carries the
 * slim rail at its left edge, its Section lit. A section slide descends into the zone through the `bubbles` ink and
 * shows the whole ruler, so its rail shows on phones only, where the ruler is hidden. A Slide names its Section, never
 * a colour: `presentation: zonePresentation({ sections, section: 4, kind: 'page' })`.
 */
export function zonePresentation({ sections, section, kind }: ZonePresentationInput): ZonePresentation {
  const zone = zoneOf(sections, section);
  const style: ZoneStyle = { '--slide-surface': zoneToken(zone), ...(isDarkZone(zone) ? LIGHT_TEXT : {}) };
  const rear = <DepthRail sections={sections} lit={section} phoneOnly={kind === 'section'} />;
  return kind === 'section'
    ? { style, enter: { effect: 'bubbles' }, rear, rearMobile: true }
    : { style, rear, rearMobile: true };
}
