'use client';

import { useCallback, useMemo, useState } from 'react';
import type { AiCapabilityWords, LayerItemId, LayerRow, LayerSpan } from './ai-capability.types';
import type { LayerRowProps, PlacedSpan } from './layer-row.client';
import { spanRange } from './spans.pure';

/*
 * The layer rows' state, held by the timeline's parent (FE-012 §4.2): which card is lit, which is pinned per row, and
 * each row's slice of it, the same object while nothing in it changes, so a memoised card redraws only when its `on`
 * or `pinned` flips.
 */

export const LAYER_ROWS: readonly LayerRow[] = ['disciplines', 'oversight'];

/** A layer row's items with their spans on the four Levels. */
const place = (spans: readonly LayerSpan[]): readonly PlacedSpan[] =>
  spans.map((span) => Object.assign({}, span, { range: spanRange(span.from, span.to) }));

/** The layer row whose placement no study backs yet. */
const HYPOTHESIS: LayerRow = 'oversight';

type LayerLight = ReturnType<typeof useLayerLight>;
type Placed = Readonly<Record<LayerRow, readonly PlacedSpan[]>>;
/** What every row of the two shares: the words, the labels and the callbacks. */
type Shared = Pick<LayerRowProps, 'labels' | 'onLight' | 'onPin'> & { readonly words: AiCapabilityWords };

/** The layer rows' brushing: the card hovered or focused, and per row the card a click pinned. */
export function useLayerLight() {
  const [lit, setLit] = useState<{ readonly row: LayerRow; readonly id: LayerItemId } | null>(null);
  const [pinned, setPinned] = useState<Readonly<Record<LayerRow, LayerItemId | null>>>({
    disciplines: null,
    oversight: null,
  });
  const onLight = useCallback(
    (row: LayerRow, id: LayerItemId | null) =>
      setLit((now) => (id !== null ? { row, id } : now?.row === row ? null : now)),
    [],
  );
  const onPin = useCallback(
    (row: LayerRow, id: LayerItemId) => setPinned((now) => ({ ...now, [row]: now[row] === id ? null : id })),
    [],
  );
  return useMemo(() => ({ lit, pinned, onLight, onPin }), [lit, pinned, onLight, onPin]);
}

/** One layer row's slice of the state: its spans, its words, which card is lit and pinned, and the callbacks. */
const rowSlice = (
  row: LayerRow,
  { shared, placed, layer }: { readonly shared: Shared; readonly placed: Placed; readonly layer: LayerLight },
): LayerRowProps => ({
  row,
  spans: placed[row],
  words: shared.words.layers[row],
  lit: layer.lit?.row === row ? layer.lit.id : null,
  pinned: layer.pinned[row],
  onLight: shared.onLight,
  onPin: shared.onPin,
  labels: shared.labels,
  hypothesis: row === HYPOTHESIS ? shared.words.hypothesis : null,
});

/** Each layer row's slice of the state, the same object while nothing in it changes. */
export function useLayerRows(
  layers: Readonly<Record<LayerRow, readonly LayerSpan[]>>,
  words: AiCapabilityWords,
  layer: LayerLight,
) {
  const placed = useMemo(
    () => ({ disciplines: place(layers.disciplines), oversight: place(layers.oversight) }),
    [layers],
  );
  const labels = useMemo(
    () => ({ source: words.source, newTab: words.newTab, emerging: words.emerging }),
    [words.source, words.newTab, words.emerging],
  );
  return useMemo(() => {
    const shared = { words, labels, onLight: layer.onLight, onPin: layer.onPin };
    return {
      disciplines: rowSlice('disciplines', { shared, placed, layer }),
      oversight: rowSlice('oversight', { shared, placed, layer }),
    };
  }, [words, labels, placed, layer]);
}
