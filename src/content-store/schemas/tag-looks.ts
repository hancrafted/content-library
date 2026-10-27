import type { TagId } from './fields';

/*
 * Each Tag's look (design-ADR Tags replace Topics), beside the vocabulary and free of zod, so a client leaf that draws a
 * card carries only these few names into the browser bundle (FE-013 §1.4). The colour itself is a token per theme in
 * `src/app/globals.css`, which the token editor adjusts.
 */

/** Each Tag's icon by name, so this stays data; `NAMED_ICONS` in `src/shared/components/ui/named-icons.ts` draws it. */
export const TAG_ICONS = {
  'context-engineering': 'hourglass',
  'agentic-ai': 'sparkles',
  markdown: 'file-text',
  cost: 'coins',
  sales: 'handshake',
  workflow: 'list-plus',
} as const satisfies Readonly<Record<TagId, string>>;

/** The CSS custom property holding a Tag's colour: `--tag-<id>`, declared under `:root` and `.dark`. */
export function tagToken(id: TagId): `--tag-${TagId}` {
  return `--tag-${id}`;
}
