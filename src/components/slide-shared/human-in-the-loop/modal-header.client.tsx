'use client';

import { cn } from '@/lib/utils';
import { Code, X } from 'lucide-react';
import { IconButton, OUTLINED_ICON } from '../core-components/icon-button/icon-button.client';
import type { UiWords } from './human-in-the-loop.types';
import { tryTitle } from './words.pure';
import type { Level } from './workflow-state.pure';
import type { StageView } from './workflow-view.pure';

interface HeaderProps {
  readonly stage: StageView;
  readonly words: UiWords;
  readonly level: Level;
  readonly onLevel: (level: Level) => void;
  readonly onClose: () => void;
}

/** The title, the learning goal under it, and at the right the simple/technical toggle beside Close. */
function LevelToggle({ words, level, onLevel }: Pick<HeaderProps, 'words' | 'level' | 'onLevel'>) {
  const technical = level === 'technical';
  return (
    <IconButton
      label={words.technical}
      tip={words.technicalTip}
      align="end"
      aria-pressed={technical}
      className={cn(OUTLINED_ICON, technical && 'bg-primary text-primary-foreground hover:bg-primary')}
      onClick={() => onLevel(technical ? 'simple' : 'technical')}
    >
      <Code aria-hidden="true" className="size-4" />
    </IconButton>
  );
}

export function ModalHeader({ stage, words, level, onLevel, onClose }: HeaderProps) {
  return (
    <header className="flex shrink-0 items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 tabIndex={-1} data-autofocus="" className="text-body font-semibold outline-none">
          {tryTitle(words, stage.name)}
        </h2>
        {stage.goal && (
          <p data-goal="" className="mt-1 text-muted-foreground">
            {stage.goal}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <LevelToggle words={words} level={level} onLevel={onLevel} />
        <IconButton label={words.close} align="end" onClick={onClose}>
          <X aria-hidden="true" className="size-4" />
        </IconButton>
      </div>
    </header>
  );
}
