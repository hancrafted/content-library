'use client';

import type { Locale } from '@/lib/locale.pure';
import { SitenavDrawer } from './sitenav-drawer';
import { SitenavPanel, sectionNumber, type SitenavLabels, type SitenavView } from './sitenav-panel';
import { SKINS, type SitenavVariant } from './sitenav-skins';
import { expandedSectionId, type SitenavSection } from './sitenav.pure';
import { useActiveId, useScrollProgress } from './use-sitenav';

export type { SitenavLabels } from './sitenav-panel';
export { SITENAV_VARIANTS, type SitenavVariant } from './sitenav-skins';
export type { SitenavSection } from './sitenav.pure';

function whereAt(sections: readonly SitenavSection[], expanded: string | null) {
  const index = sections.findIndex((section) => section.id === expanded);
  return index < 0 ? null : { number: sectionNumber(index), title: sections[index].title };
}

/**
 * A reusable, page-agnostic sitenav. It knows only its entries, the data
 * attribute its targets carry (value = entry id = URL fragment), the route
 * those fragments sit on, and pre-translated labels. Sticky panel from `md`,
 * pill-and-drawer below it.
 */
export function Sitenav(props: {
  locale: Locale;
  route: string;
  sections: readonly SitenavSection[];
  targetAttribute: string;
  labels: SitenavLabels;
  variant: SitenavVariant;
}) {
  const active = useActiveId(props.sections, props.targetAttribute);
  const progress = useScrollProgress();
  // Before the first observation, open the first section rather than everything, so nothing collapses on load.
  const expanded = expandedSectionId(props.sections, active ?? props.sections[0]?.id ?? null);
  const view: SitenavView = { locale: props.locale, route: props.route, skin: SKINS[props.variant], active, expanded };
  const panel = { view, sections: props.sections, labels: props.labels, progress };
  return (
    <>
      <SitenavPanel {...panel} testId="sitenav" className="sticky top-24 hidden max-h-[calc(100svh-7rem)] md:flex" />
      <SitenavDrawer
        closeClassName={view.skin.drawerClose}
        labels={props.labels}
        where={whereAt(props.sections, expanded)}
        progress={progress}
      >
        <SitenavPanel {...panel} className={`h-full max-h-full pt-14 ${view.skin.drawerPanel}`} />
      </SitenavDrawer>
    </>
  );
}
