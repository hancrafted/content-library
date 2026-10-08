'use client';

import type { Locale } from '@/lib/locale.pure';
import { useMemo } from 'react';
import { ownerOf, readingTime, type TocSection } from './table-of-contents.pure';
import { TocDrawer } from './toc-drawer';
import { remainingLabel, type TocLabels } from './toc-heading';
import { sectionNumber, TocPanel, type TocView } from './toc-panel';
import { useActiveId, useFractionInto, useOpenSections, useRevealed, useSettled } from './use-table-of-contents';

export type { TocSection } from './table-of-contents.pure';
export type { TocLabels } from './toc-heading';

function pageOrder(sections: readonly TocSection[]): { ids: string[]; minutes: number[] } {
  const entries = sections.flatMap((section) => [section, ...section.items]);
  return { ids: entries.map((entry) => entry.id), minutes: entries.map((entry) => entry.minutes) };
}

/** The section the reader is in, for the pill; chevron toggles do not move it. */
function whereAt(sections: readonly TocSection[], active: string | null) {
  const owner = ownerOf(sections, active);
  const index = sections.findIndex((section) => section.id === owner);
  return index < 0 ? null : { number: sectionNumber(index), title: sections[index].title };
}

/** Active entry, open sections and reading time, all derived from what the observer sees. */
function useTocState(props: {
  locale: Locale;
  route: string;
  sections: readonly TocSection[];
  targetAttribute: string;
}) {
  const order = useMemo(() => pageOrder(props.sections), [props.sections]);
  const observed = useActiveId(order.ids, props.targetAttribute);
  const fraction = useFractionInto(observed, props.targetAttribute);
  const settled = useSettled(observed);
  const revealed = useRevealed(settled);
  const time = readingTime(order.minutes, observed ? order.ids.indexOf(observed) : -1, fraction);
  // Before the first observation, treat the first entry as active, so nothing collapses on load.
  const active = observed ?? order.ids[0] ?? null;
  const { open, toggle } = useOpenSections(props.sections, active);
  const view: TocView = { locale: props.locale, route: props.route, active, open, toggle, settled, revealed };
  return { view, time };
}

/**
 * A reusable, page-agnostic table of contents. It knows only its entries
 * (with reading minutes), the data attribute its targets carry (value = entry
 * id = URL fragment), the route those fragments sit on, and pre-translated
 * labels. Sticky panel from `md`, pill-and-drawer below it.
 */
export function TableOfContents(props: {
  locale: Locale;
  route: string;
  sections: readonly TocSection[];
  targetAttribute: string;
  labels: TocLabels;
}) {
  const { view, time } = useTocState(props);
  const panel = { view, sections: props.sections, labels: props.labels, time };
  return (
    <>
      <TocPanel {...panel} testId="toc" className="sticky top-24 hidden max-h-[calc(100svh-7rem)] md:flex" />
      <TocDrawer
        labels={props.labels}
        where={view.revealed ? whereAt(props.sections, view.active) : null}
        revealed={view.revealed}
        left={remainingLabel(props.labels, props.locale, time.remaining)}
      >
        <TocPanel {...panel} view={{ ...view, revealed: true }} className="h-full max-h-full bg-background pt-14" />
      </TocDrawer>
    </>
  );
}
