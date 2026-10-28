'use client';

import { Bug } from 'lucide-react';
import type { UiWords } from './human-in-the-loop.types';
import { ToolButton } from './tool-button.client';

/** The Debug icon toggle: the copy buttons add the footer instruction while it is on. Drawn only where it is available. */
export function DebugToggle({
  words,
  debug,
  onDebug,
}: {
  readonly words: UiWords;
  readonly debug: { readonly show: boolean; readonly on: boolean };
  readonly onDebug: (debug: boolean) => void;
}) {
  if (!debug.show) return null;
  return (
    <ToolButton
      label={words.debug}
      tip={words.debugTip}
      pressed={debug.on}
      variant="ghost"
      data-control="debug"
      onClick={() => onDebug(!debug.on)}
    >
      <Bug aria-hidden="true" />
    </ToolButton>
  );
}
