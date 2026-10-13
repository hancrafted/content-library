/*
 * What the Episode checks report: the staging folder's cross-file checks and
 * the pipeline schema check both answer with a list of findings.
 */

/** What a check found wrong, keyed by the rule it broke. */
export type FindingKind =
  | 'spine'
  | 'visual'
  | 'title-slide'
  | 'speaker-note'
  | 'voice-script'
  | 'feedback'
  | 'feedback-round'
  | 'research-date'
  | 'run-log-order'
  | 'research-index'
  | 'runs-header'
  | 'pipeline'
  | 'research-folder';

export interface Finding {
  kind: FindingKind;
  /** The file the finding is about, relative to the folder checked. */
  file: string;
  message: string;
}

/** The finding (or message), unless the rule holds. */
export function unless<T>(holds: boolean, finding: T): T[] {
  return holds ? [] : [finding];
}
