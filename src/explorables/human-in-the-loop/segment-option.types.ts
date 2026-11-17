export interface SegmentOption<T extends string> {
  readonly value: T;
  readonly label: string;
  readonly tip?: string;
}
