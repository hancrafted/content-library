import type { TagId } from './fields';

// decision: docs/decision-records/0015-tags-replace-topics.md
// decision: FE-013 §1.4
export const TAG_ICONS = {
  'context-engineering': 'hourglass',
  'agentic-ai': 'sparkles',
  markdown: 'file-text',
  cost: 'coins',
  sales: 'handshake',
  'agentic-workflow': 'list-plus',
  overview: 'layout-dashboard',
} as const satisfies Readonly<Record<TagId, string>>;

export const TAG_ARTWORK = {
  'context-engineering': 'handoff-chain',
  'agentic-ai': 'context-boundary',
  markdown: 'document-stack',
  cost: 'budget-gauge',
  sales: 'customer-path',
  'agentic-workflow': 'process-loop',
  overview: 'overview-map',
} as const satisfies Readonly<Record<TagId, string>>;

export function tagToken(id: TagId): `--tag-${TagId}` {
  return `--tag-${id}`;
}
