'use client';

import type { RowAddon } from '../token-row.client';
import { TokenUsage } from './token-usage.client';

// decision: docs/adr/0003-token-usage-lookup-is-experimental.md
export const usageRowAddon: RowAddon = (row) => <TokenUsage {...row} />;
