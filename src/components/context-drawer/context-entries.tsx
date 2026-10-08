import type { ContextSlide } from '@/lib/context-drawer.pure';
import type { ContextLabels } from './context-labels';
import { SlideNotes } from './slide-notes';
import { SlideScript } from './slide-script';

/** One Slide's pre-rendered panels, handed to the client drawer, which only picks which to show. */
export interface ContextEntry {
  readonly anchor: string;
  readonly title: string;
  readonly notes: React.ReactNode;
  readonly script: React.ReactNode;
}

export function contextEntries(slides: readonly ContextSlide[], labels: ContextLabels): ContextEntry[] {
  return slides.map(({ anchor, title, notes, segments }) => ({
    anchor,
    title,
    notes: <SlideNotes notes={notes} labels={labels} />,
    script: <SlideScript segments={segments} labels={labels} />,
  }));
}
