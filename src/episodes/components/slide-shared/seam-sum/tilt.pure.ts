/** The hand-placed tilt of the card at `index`: alternately to the right and to the left, the first to the right. */
export function tiltOf(index: number): 'rotate-1' | '-rotate-1' {
  return index % 2 === 0 ? 'rotate-1' : '-rotate-1';
}
