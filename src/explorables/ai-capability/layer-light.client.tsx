'use client';

import { useCallback, useMemo, useState } from 'react';
import type { AiCapabilityWords, LayerItemId, LayerRow, LayerSpan } from './ai-capability.types';
import type { LayerRowProps, PlacedSpan } from './layer-row.client';
import { spanRange } from './spans.pure';

// decision: FE-012 §4.1
export const LAYER_ROWS: readonly LayerRow[] = ['disciplines', 'oversight'];

const place = (spans: readonly LayerSpan[]): readonly PlacedSpan[] =>
  spans.map((span) => Object.assign({}, span, { range: spanRange(span.from, span.to) }));

const HYPOTHESIS: LayerRow = 'oversight';

type LayerLight = ReturnType<typeof useLayerLight>;
type Placed = Readonly<Record<LayerRow, readonly PlacedSpan[]>>;
type Shared = Pick<LayerRowProps, 'labels' | 'onToggle'> & { readonly words: AiCapabilityWords };

export function useLayerLight() {
  const [open, setOpen] = useState<readonly LayerItemId[]>([]);
  const onToggle = useCallback(
    (id: LayerItemId) => setOpen((now) => (now.includes(id) ? now.filter((each) => each !== id) : [...now, id])),
    [],
  );
  return useMemo(() => ({ open, onToggle }), [open, onToggle]);
}

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
