import type { ContextDrawerLabels, ContextItem } from './context-drawer-input';
import { SlideNotes } from './slide-notes';
import { SlideScript } from './slide-script';

/** One item's pre-rendered panels, handed to the client drawer, which only picks which to show. */
export interface ContextEntry {
  readonly id: string;
  readonly title?: string;
  readonly notes: React.ReactNode;
  readonly script: React.ReactNode;
}

export function contextEntries(items: readonly ContextItem[], labels: ContextDrawerLabels): ContextEntry[] {
  return items.map(({ id, title, notes, script, explainer }) => ({
    id,
    title,
    notes: <SlideNotes notes={notes} labels={labels} explainer={explainer} />,
    script: <SlideScript segments={script} labels={labels} explainer={explainer} />,
  }));
}
