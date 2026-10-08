'use client';

import { useFractionInto, useGlideTo, useOpenSections, useRevealed, useSettled } from '@/hooks/use-table-of-contents';
import { useActiveSlide } from '@/hooks/use-url-state';
import type { Locale } from '@/lib/locale.pure';
import { activeEntry, ownerOf, readingOrder, readingTime, type TocSection } from '@/lib/table-of-contents.pure';
import { useMemo, useSyncExternalStore } from 'react';
import { TocDrawer } from './toc-drawer';
import { remainingLabel, type TocLabels } from './toc-heading';
import { sectionNumber, TocPanel, type TocView } from './toc-panel';

export type { TocSection } from '@/lib/table-of-contents.pure';
export type { TocLabels } from './toc-heading';

/** The section the reader is in, for the pill; chevron toggles do not move it. */
function whereAt(sections: readonly TocSection[], active: string | null) {
  const owner = ownerOf(sections, active);
  const index = sections.findIndex((section) => section.id === owner);
  return index < 0 ? null : { number: sectionNumber(index), title: sections[index].title };
}

const NOTHING = () => undefined;
const NEVER_CHANGES = () => NOTHING;

/** False in prerendered HTML and during hydration, true after: the URL's hash is only known to the client. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    NEVER_CHANGES,
    () => true,
    () => false,
  );
}

/** Active entry, open sections and reading time, all derived from the active Slide in the URL. */
function useTocState(props: {
  locale: Locale;
  route: string;
  sections: readonly TocSection[];
  targetAttribute: string;
  topId: string;
}) {
  const glideTo = useGlideTo();
  const order = useMemo(() => readingOrder(props.sections), [props.sections]);
  const slide = useActiveSlide();
  const active = activeEntry(order.owners, slide, props.topId);
  const atTop = slide === props.topId;
  const fraction = useFractionInto(slide, props.targetAttribute);
  // The server cannot know the hash, so the table holds its loading box until the client has read it.
  const settled = useSettled(useHydrated() ? slide : null);
  const revealed = useRevealed(settled);
  const time = readingTime(order.minutes, slide ? order.ids.indexOf(slide) : -1, fraction);
  const { open, toggle } = useOpenSections(props.sections, active);
  const { locale, route, topId } = props;
  const base = { locale, route, topId, atTop, glideTo, active, open, toggle };
  const view: TocView = { ...base, settled, revealed };
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
  /** The id of the Slide at the top of the page: no entry is current there, and the heading links to it. */
  topId: string;
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
