import { ZoneLabelButton } from './zone-label.client';
import type { ZoneLabelWords } from './zone-words.pure';

// decision: docs/decision-records/0025-scene-figures-are-deep-modules.md
export function ZoneLabel({ words, className }: { readonly words: ZoneLabelWords; readonly className?: string }) {
  return <ZoneLabelButton words={words} className={className} />;
}
