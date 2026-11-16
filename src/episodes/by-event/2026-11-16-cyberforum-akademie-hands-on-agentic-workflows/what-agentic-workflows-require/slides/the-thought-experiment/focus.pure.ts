/** How one card of the group reads while `lit` is the slug being pointed at, or null when nothing is. */
export type FocusState = 'rest' | 'lit' | 'dimmed';

/** A card is lit when it is the one pointed at, dimmed when another is, and at rest when none is. */
export function focusOf(lit: string | null, each: string): FocusState {
  if (lit === null) return 'rest';
  return lit === each ? 'lit' : 'dimmed';
}
