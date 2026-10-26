/** One choice of a segmented control: the value it sets, the word on it and, where it has one, a tooltip. */
export interface SegmentOption<T extends string> {
  readonly value: T;
  readonly label: string;
  readonly tip?: string;
}
