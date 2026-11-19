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

export interface ZoneSurface {
  readonly background: string;
  readonly foreground: string;
  readonly muted: string;
  readonly textScope: 'slide';
}

export type ZoneStyle = Readonly<Record<`--${string}`, string>>;

// decision: docs/decision-records/0022-slide-presentation-and-transition-clock.md
export interface ZonePresentation {
  readonly surface?: ZoneSurface;
  readonly style: ZoneStyle;
  readonly enter?: { readonly effect: 'bubbles' };
  readonly rear: ReactNode;
  readonly rearMobile: true;
}

type SlideKind = 'title' | ZonePresentationInput['kind'];

const ZONE_BACKGROUNDS: Readonly<Record<SlideKind, boolean>> = { title: true, section: true, page: false };

// decision: docs/decision-records/0030-slide-surface-and-the-inverse-flag.md
function zoneSurface(zone: Zone): ZoneSurface {
  const ink = isDarkZone(zone) ? 'var(--on-brand-accent)' : zoneToken('abyss');
  return {
    background: surfaceOf(zone),
    foreground: ink,
    muted: `color-mix(in oklab, ${ink} 78%, transparent)`,
    textScope: 'slide',
  };
}

// spec: docs/features/slide-transitions.md#per-slide-reading-space
function zoneLook(zone: Zone, kind: SlideKind): Pick<ZonePresentation, 'surface' | 'style'> {
  if (!ZONE_BACKGROUNDS[kind]) return { style: {} };
  const landing: ZoneStyle =
    kind === 'section' ? { '--slide-anchor-offset': '0px', '--slide-space-before': 'var(--header-block)' } : {};
  return { surface: zoneSurface(zone), style: landing };
}

function surfaceOf(zone: Zone): string {
  return zone === 'surface' ? skyTop() : zoneToken(zone);
}

export function zoneTitlePresentation(): Pick<ZonePresentation, 'surface' | 'style'> {
  return zoneLook('surface', 'title');
}

export function zonePresentation({ sections, section, kind, scene }: ZonePresentationInput): ZonePresentation {
  const zone = zoneOf(sections, section);
  const rail = <DepthRail sections={sections} lit={section} phoneOnly={kind === 'section'} />;
  if (kind === 'page') return { ...zoneLook(zone, kind), rear: rail, rearMobile: true };
  return {
    ...zoneLook(zone, kind),
    enter: { effect: 'bubbles' },
    rear: (
      <>
        {scene}
        {rail}
      </>
    ),
    rearMobile: true,
  };
}
