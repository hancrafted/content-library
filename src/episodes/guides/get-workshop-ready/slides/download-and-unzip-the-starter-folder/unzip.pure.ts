import { osOf } from './picks.pure';

/**
 * How the picked OS unzips the starter folder: a double-click on Mac; the zip's right-click menu on Windows (Extract
 * All) and Linux (the file manager's Extract Here). Only Windows warns, since there a double-click merely looks
 * inside the zip and unzips nothing.
 */
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
