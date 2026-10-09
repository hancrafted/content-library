'use client';

import { useFractionInto, useOpenSections, useRevealed, useSettled } from '@/hooks/use-table-of-contents';
import { useActiveSlide, useGlideTo } from '@/hooks/use-url-state';
import type { Locale } from '@/lib/locale.pure';
import { hasReadingTime, remainingLabel } from '@/lib/speaking-time.pure';
import { activeEntry, readingOrder, readingTime, whereAt, type TocSection } from '@/lib/table-of-contents.pure';
import { useMemo, useSyncExternalStore } from 'react';
import { TocDrawer } from './toc-drawer';
import type { TocLabels } from './toc-heading';
import { TocPanel, type TocView } from './toc-panel';

export type { TocSection } from '@/lib/table-of-contents.pure';
export type { TocLabels } from './toc-heading';

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
        left={
          hasReadingTime(time.total) ? remainingLabel(props.labels.remaining, props.locale, time.remaining) : undefined
        }
      >
        <TocPanel {...panel} view={{ ...view, revealed: true }} className="h-full max-h-full bg-background pt-14" />
      </TocDrawer>
    </>
  );
}
