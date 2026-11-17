import { osOf } from './picks.pure';

export interface UnzipGesture {
  readonly kind: 'double-click' | 'menu';
  readonly warn: boolean;
}

const GESTURES = {
  mac: { kind: 'double-click', warn: false },
  windows: { kind: 'menu', warn: true },
  linux: { kind: 'menu', warn: false },
} as const satisfies Record<string, UnzipGesture>;

export function unzipGesture(os: string): UnzipGesture {
  return GESTURES[osOf(os)];
}
