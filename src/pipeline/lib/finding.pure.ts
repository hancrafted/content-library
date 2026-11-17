export type FindingKind =
  | 'spine'
  | 'brief-slide'
  | 'brief-research'
  | 'brief-thread'
  | 'brief-spine'
  | 'visual'
  | 'title-slide'
  | 'speaker-note'
  | 'voice-script'
  | 'feedback'
  | 'feedback-round'
  | 'research-sources'
  | 'title'
  | 'run-log-order'
  | 'research-index'
  | 'runs-header'
  | 'pipeline'
  | 'research-folder'
  | 'spec';

export interface Finding {
  kind: FindingKind;
  file: string;
  message: string;
}

export function unless<T>(holds: boolean, finding: T): T[] {
  return holds ? [] : [finding];
}

export function repeated<T>(values: readonly T[]): T[] {
  return [...new Set(values.filter((value, at) => values.indexOf(value) !== at))];
}
