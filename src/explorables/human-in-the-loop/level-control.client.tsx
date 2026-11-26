'use client';

import { Code } from 'lucide-react';
import type { UiWords } from './human-in-the-loop.types';
import { toggledLevel } from './level-toggle.pure';
import { ToolButton } from './tool-button.client';
import type { Level } from './workflow-state.pure';

interface LevelControlProps {
  readonly words: UiWords;
  readonly level: Level;
  readonly onLevel: (level: Level) => void;
}

export function LevelControl({ words, level, onLevel }: LevelControlProps) {
  return (
    <ToolButton
      label={words.cli}
      tip={words.cliTip}
      pressed={level === 'technical'}
      text
      variant="ghost"
      data-control="level"
      onClick={() => onLevel(toggledLevel(level))}
    >
      <Code aria-hidden="true" />
    </ToolButton>
  );
}
