export type FocusState = 'rest' | 'lit' | 'dimmed';

export function focusOf(lit: string | null, each: string): FocusState {
  if (lit === null) return 'rest';
  return lit === each ? 'lit' : 'dimmed';
}

export function litOf(hovered: string | null, focused: string | null): string | null {
  return hovered ?? focused;
}

export function release(current: string | null, slug: string): string | null {
  return current === slug ? null : current;
}
