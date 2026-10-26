'use client';

import type { RowAddon } from '../token-row.client';
import { TokenUsage } from './token-usage.client';

/**
 * The token editor's one integration point for "Find usage" (docs/adr/0003): the editor root
 * passes this as `rowAddon`. Deleting this folder and that one prop removes the feature.
 */
export const usageRowAddon: RowAddon = (row) => <TokenUsage {...row} />;
