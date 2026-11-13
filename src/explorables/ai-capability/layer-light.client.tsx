'use client';

import { useCallback, useMemo, useState } from 'react';
import type { AiCapabilityWords, LayerItemId, LayerRow, LayerSpan } from './ai-capability.types';
import type { LayerRowProps, PlacedSpan } from './layer-row.client';
import { spanRange } from './spans.pure';

/*
 * The layer rows' state, held by the timeline's parent (FE-012 §4.1): which cards are open, and each row's slice of it,
 * the same object while nothing in it changes, so a memoised card redraws only when its `open` flips.
 */

export const LAYER_ROWS: readonly LayerRow[] = ['disciplines', 'oversight'];

/** A layer row's items with their spans on the four Levels. */
const place = (spans: readonly LayerSpan[]): readonly PlacedSpan[] =>
  spans.map((span) => Object.assign({}, span, { range: spanRange(span.from, span.to) }));

/** The layer row whose placement no study backs yet. */
const HYPOTHESIS: LayerRow = 'oversight';

type LayerLight = ReturnType<typeof useLayerLight>;
type Placed = Readonly<Record<LayerRow, readonly PlacedSpan[]>>;
/** What every row of the two shares: the words, the labels and the callback. */
type Shared = Pick<LayerRowProps, 'labels' | 'onToggle'> & { readonly words: AiCapabilityWords };

/** The layer rows' disclosure: which cards are open, each on its own. */
export function useLayerLight() {
  const [open, setOpen] = useState<readonly LayerItemId[]>([]);
  const onToggle = useCallback(
    (id: LayerItemId) => setOpen((now) => (now.includes(id) ? now.filter((each) => each !== id) : [...now, id])),
    [],
  );
  return useMemo(() => ({ open, onToggle }), [open, onToggle]);
}

/** One layer row's slice of the state: its spans, its words, which cards are open, and the callback. */
const rowSlice = (
  row: LayerRow,
  { shared, placed, layer }: { readonly shared: Shared; readonly placed: Placed; readonly layer: LayerLight },
): LayerRowProps => ({
  row,
  spans: placed[row],
  words: shared.words.layers[row],
  open: layer.open,
  onToggle: shared.onToggle,
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
  const labels = useMemo(() => ({ newTab: words.newTab, emerging: words.emerging }), [words.newTab, words.emerging]);
  return useMemo(() => {
    const shared = { words, labels, onToggle: layer.onToggle };
    return {
      disciplines: rowSlice('disciplines', { shared, placed, layer }),
      oversight: rowSlice('oversight', { shared, placed, layer }),
    };
  }, [words, labels, placed, layer]);
}
