import type { ReactNode } from 'react';
import { DepthRail } from './depth-rail';
import { skyTop } from './scenery/sky.pure';
import { isDarkZone, zoneOf, zoneToken, type Zone } from './zones.pure';

export interface ZonePresentationInput {
  readonly sections: readonly Zone[];
  readonly section: number;
  readonly kind: 'section' | 'page';
  readonly scene?: ReactNode;
}

export type ZoneStyle = Readonly<Record<`--${string}`, string>> & { readonly '--slide-surface'?: string };

// decision: docs/adr/0022-slide-presentation-and-transition-clock.md
export interface ZonePresentation {
  readonly style: ZoneStyle;
  readonly enter?: {
    readonly effect: 'bubbles';
    readonly style: Readonly<Record<'--slide-transition-bubble', string>>;
  };
  readonly rear: ReactNode;
  readonly rearMobile: true;
}

type SlideKind = 'title' | ZonePresentationInput['kind'];

const ZONE_BACKGROUNDS: Readonly<Record<SlideKind, boolean>> = { title: true, section: true, page: false };

function zoneText(zone: Zone): ZoneStyle {
  const ink = isDarkZone(zone) ? 'var(--on-brand-accent)' : zoneToken('abyss');
  return {
    '--slide-surface-foreground': ink,
    '--foreground': ink,
    '--muted-foreground': `color-mix(in oklab, ${ink} 78%, transparent)`,
  };
}

// spec: docs/features/slide-transitions.md#per-slide-reading-space
function zoneSurface(zone: Zone, kind: SlideKind): ZoneStyle {
  if (!ZONE_BACKGROUNDS[kind]) return {};
  const landing: ZoneStyle =
    kind === 'section' ? { '--slide-anchor-offset': '0px', '--slide-space-before': 'var(--header-block)' } : {};
  return { '--slide-surface': surfaceOf(zone), ...zoneText(zone), ...landing };
}

function surfaceOf(zone: Zone): string {
  return zone === 'surface' ? skyTop() : zoneToken(zone);
}

export function zoneTitlePresentation(): { readonly style: ZoneStyle } {
  return { style: zoneSurface('surface', 'title') };
}

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
