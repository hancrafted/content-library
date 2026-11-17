import type { ContextDrawerInput } from './context-drawer-input';
import { ContextDrawer } from './context-drawer.client';
import { contextEntries } from './context-entries';

// decision: FE-010 §2
// decision: FE-010 §8
export function ContextDrawerSlot({ input }: { input: ContextDrawerInput }) {
  const { strings } = input.labels;
  return (
    <aside data-slot="context" aria-label={strings.title}>
      <ContextDrawer labels={strings} entries={contextEntries(input.items, input.labels)} />
    </aside>
  );
}
