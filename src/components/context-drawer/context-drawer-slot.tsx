import type { ContextDrawerInput } from './context-drawer-input';
import { ContextDrawer } from './context-drawer.client';
import { contextEntries } from './context-entries';

/**
 * The Context drawer's slot (FE-010 §2, §8): every item's notes and script,
 * pre-rendered into the page, plus the client drawer that picks which to show.
 * A Server Component; it takes one `ContextDrawerInput` and nothing else.
 */
export function ContextDrawerSlot({ input }: { input: ContextDrawerInput }) {
  const { title, open, close, shortcut, slide, tabs, menu } = input.labels;
  // Only plain strings cross to the client: `labels.sources` is a function.
  const labels = { title, open, close, shortcut, slide, tabs, menu };
  return (
    <aside data-slot="context" aria-label={title}>
      <ContextDrawer labels={labels} entries={contextEntries(input.items, input.labels)} />
    </aside>
  );
}
