export function tiltOf(index: number): 'rotate-1' | '-rotate-1' {
  return index % 2 === 0 ? 'rotate-1' : '-rotate-1';
}
