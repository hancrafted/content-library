/** The labels the output renderers draw. English defaults; a Workflow or Slide passes its locale's words over them. */
export interface OutputWords {
  readonly goal: string;
  readonly requirements: string;
  readonly outOfScope: string;
  readonly slices: string;
  readonly tickets: string;
  readonly acceptance: string;
  readonly blockedBy: string;
  readonly ready: string;
  readonly done: string;
  readonly blocked: string;
  readonly progress: string;
  readonly graphHint: string;
  readonly facts: string;
  readonly criteria: string;
  readonly ranking: string;
  readonly rank: string;
  readonly option: string;
  readonly why: string;
}

export const DEFAULT_OUTPUT_WORDS: OutputWords = {
  goal: 'Goal',
  requirements: 'Requirements',
  outOfScope: 'Out of scope',
  slices: 'Slices',
  tickets: 'Tickets',
  acceptance: 'Done when',
  blockedBy: 'After',
  ready: 'Ready',
  done: 'Done',
  blocked: 'Waiting',
  progress: '{done} of {total} done',
  graphHint: 'Click a ready ticket to tick it off and unlock what it blocks.',
  facts: 'Facts',
  criteria: 'Criteria',
  ranking: 'Ranking',
  rank: '#',
  option: 'Option',
  why: 'Why',
};
