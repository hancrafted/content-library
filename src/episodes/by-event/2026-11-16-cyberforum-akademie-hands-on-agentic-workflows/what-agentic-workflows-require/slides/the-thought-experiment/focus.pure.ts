/** How one card of the group reads while `lit` is the slug being pointed at, or null when nothing is. */
export type FocusState = 'rest' | 'lit' | 'dimmed';

/** A card is lit when it is the one pointed at, dimmed when another is, and at rest when none is. */
export function focusOf(lit: string | null, each: string): FocusState {
  if (lit === null) return 'rest';
  return lit === each ? 'lit' : 'dimmed';
}

/** The pointer and the keyboard are tracked apart; the hovered card wins, else the focused one. */
export function litOf(hovered: string | null, focused: string | null): string | null {
  return hovered ?? focused;
}

/** What a card's pointer-leave or blur leaves behind: nothing if it held the state, else the other card's hold. */
export function release(current: string | null, slug: string): string | null {
  return current === slug ? null : current;
}
