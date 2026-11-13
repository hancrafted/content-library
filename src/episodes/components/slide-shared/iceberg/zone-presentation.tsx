import type { ReactNode } from 'react';
import { DepthRail } from './depth-ruler';
import type { Zone } from './ruler.pure';

/** Zones dark in both themes, whose Slides carry light text in both. */
const DARK_ZONES: ReadonlySet<Zone> = new Set(['midnight', 'abyss']);

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
  readonly rear?: ReactNode;
}

const LIGHT_TEXT: Readonly<Record<`--${string}`, string>> = {
  '--slide-surface-foreground': 'var(--on-brand-accent)',
  '--foreground': 'var(--on-brand-accent)',
  '--muted-foreground': 'color-mix(in oklab, var(--on-brand-accent) 78%, transparent)',
};

/**
 * A Slide's place in the Iceberg style (design guide, Iceberg): its Section's zone colours its whole surface, from the
 * one `--zone-<zone>` token, and turns its text light where the zone is dark in both themes. A section slide descends
 * into the zone through the `bubbles` ink; a page Slide carries the slim rail at its left edge, its Section lit. A
 * Slide names its Section, never a colour: `presentation: zonePresentation({ sections, section: 4, kind: 'page' })`.
 */
export function zonePresentation({ sections, section, kind }: ZonePresentationInput): ZonePresentation {
  const zone = sections[section];
  if (zone === undefined) throw new Error(`No Section ${section} of ${sections.length}; Sections count from 0.`);
  const style: ZoneStyle = {
    '--slide-surface': `var(--zone-${zone})`,
    ...(DARK_ZONES.has(zone) ? LIGHT_TEXT : {}),
  };
  return kind === 'section'
    ? { style, enter: { effect: 'bubbles' } }
    : { style, rear: <DepthRail sections={sections} lit={section} /> };
}
