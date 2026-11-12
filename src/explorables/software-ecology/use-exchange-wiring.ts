import { useMemo, useState } from 'react';
import { NO_OVERLAYS, type Overlays, type PageState } from './exchange-file.pure.ts';
import type { ExchangeWords } from './exchange-words.types';
import type { Bundle, CatalogWords, Locale, ViewId } from './software-ecology.types';
import type { CompareActions } from './use-compare.ts';
import type { DashboardState } from './use-dashboard.ts';
import type { Display } from './use-display.ts';
import { useExchange, type ExchangeActions, type Loaded } from './use-exchange.ts';
import type { FactoryView } from './use-factory.ts';
import type { TourActions } from './use-tour.ts';

/*
 * The exchange file wired into the client parent (design-ADR 0024 §11): the use cases a visitor uploaded beside the
 * shipped ones, the page state Download saves, and what loading a file sets. The parent owns the state.
 */

/** The shipped use cases with the uploaded ones in their place, or after them: an upload replaces a use case by id. */
export function useUploads(shipped: readonly Bundle[]) {
  const [own, setOwn] = useState<readonly Bundle[]>([]);
  const [overlays, setOverlays] = useState<Overlays>(NO_OVERLAYS);
  const bundles = useMemo(() => {
    const ids = new Set(shipped.map((b) => b.data.id));
    return [
      ...shipped.map((b) => own.find((o) => o.data.id === b.data.id) ?? b),
      ...own.filter((o) => !ids.has(o.data.id)),
    ];
  }, [shipped, own]);
  const add = (b: Bundle) => setOwn((was) => [...was.filter((o) => o.data.id !== b.data.id), b]);
  return { bundles, add, overlays, setOverlays };
}

type Uploads = ReturnType<typeof useUploads>;

/** What of the parent's parts the exchange file reads and sets. */
export interface ExchangeParts {
  readonly B: Bundle;
  readonly view: ViewId;
  readonly uploads: Uploads;
  readonly dash: DashboardState;
  readonly compare: CompareActions;
  readonly display: Display;
  readonly setUseCase: (id: string) => void;
  readonly setChosen: (v: ViewId) => void;
}

const pageOf = (x: ExchangeParts, f: FactoryView): PageState => ({
  preset: f.controls.preset,
  view: x.view,
  speed: f.controls.speed,
  beltMotion: x.display.beltMotion,
  compare: x.compare.state.ids,
  overlays: x.uploads.overlays,
  s: f.controls.settings,
});

/** A loaded file shows as the reference build's `importText` leaves the page: its use case, its state, its view. */
const loadInto = (x: ExchangeParts, y: { f: FactoryView; tour: TourActions }) => (up: Loaded) => {
  const { bundle, page } = up;
  x.dash.dismiss();
  y.tour.end();
  x.uploads.add(bundle);
  x.uploads.setOverlays(page.overlays);
  x.setUseCase(bundle.data.id);
  x.setChosen(page.view);
  x.compare.reset(page.compare);
  x.display.onBeltMotion(page.beltMotion);
  y.f.controls.load(bundle, { preset: page.preset, s: page.s, speed: page.speed });
};

export function useExchangeWiring(
  x: ExchangeParts,
  y: {
    f: FactoryView;
    tour: TourActions;
    p: { words: { exchange: ExchangeWords }; catalogs: Readonly<Record<Locale, CatalogWords>> };
    name: string;
  },
): ExchangeActions {
  return useExchange({
    words: y.p.words.exchange,
    catalogs: y.p.catalogs,
    current: () => ({ B: x.B, name: y.name, page: pageOf(x, y.f) }),
    onLoad: loadInto(x, y),
  });
}
