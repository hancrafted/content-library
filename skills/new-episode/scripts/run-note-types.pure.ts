/**
 * What a note on a Job says: where a human is needed, what blocked, what research went without, a spine change, a
 * Slide with no library match, a research question no Concept covers.
 */
export const NOTE_TYPES = [
  'needs-human',
  'blocked',
  'research-gap',
  'spine-change',
  'no-library-match',
  'concept-gap',
] as const;
export type NoteType = (typeof NOTE_TYPES)[number];
