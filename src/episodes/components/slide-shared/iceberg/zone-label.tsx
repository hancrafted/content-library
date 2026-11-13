import { ZoneLabelButton, type ZoneLabelWords } from './zone-label.client';

export type { ZoneLabelWords } from './zone-label.client';

/**
 * A zone's label (design-ADR 0025, Interaction 2): the plain name stays visible, a button whose popover gives the
 * depth in metres and the scientific name on hover, focus or tap. The server entry of its client leaf.
 */
export function ZoneLabel({ words, className }: { readonly words: ZoneLabelWords; readonly className?: string }) {
  return <ZoneLabelButton words={words} className={className} />;
}
