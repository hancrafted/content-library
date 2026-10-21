/** The labels the output renderers draw: the `output:` tree of the visual's YAML pair, one set per locale. */
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
