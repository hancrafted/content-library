'use client';

import type { ToolbarProps } from './human-in-the-loop.types';

/** The toolbar part. A stub until the toolbar ticket draws the switches, the picker, upload and download. */
export function ToolbarPart({ mode }: ToolbarProps) {
  return <div data-part="toolbar" data-mode={mode} />;
}
