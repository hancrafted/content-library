'use client';

import { DialogClose, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { CircleHelp, X } from 'lucide-react';
import type { UiWords } from './human-in-the-loop.types';
import { LevelControl } from './level-control.client';
import type { TeachingProps } from './progress-controls.types';
import { TeachingControls } from './teaching-controls.client';
import { ToolButton } from './tool-button.client';
import { tryTitle } from './words.pure';
import type { Level } from './workflow-state.pure';
import type { StageView } from './workflow-view.pure';

interface HeaderProps extends TeachingProps {
  readonly stage: StageView;
  readonly words: UiWords;
  readonly level: Level;
  readonly onLevel: (level: Level) => void;
  readonly showContext: boolean;
  readonly onContext: (show: boolean) => void;
  readonly confirming: boolean;
  readonly onConfirming: (open: boolean) => void;
}

function Actions(props: Omit<HeaderProps, 'stage'>) {
  const { words, level, onLevel, showContext, onContext } = props;
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
      <TeachingControls {...props} />
      <ToolButton
        label={words.context}
        tip={words.contextTip}
        pressed={showContext}
        text
        onClick={() => onContext(!showContext)}
      >
        <CircleHelp aria-hidden="true" />
      </ToolButton>
      <LevelControl words={words} level={level} onLevel={onLevel} />
      <DialogClose asChild>
        <ToolButton label={words.close}>
          <X aria-hidden="true" />
        </ToolButton>
      </DialogClose>
    </div>
  );
}

/** The title at the left; at the right the teaching switch and Reset, the info and Chat · CLI control beside Close. */
export function ModalHeader({ stage, ...actions }: HeaderProps) {
  return (
    <DialogHeader>
      <DialogTitle asChild>
        <h3 data-autofocus="" tabIndex={-1} className="text-subheading font-semibold outline-none">
          {tryTitle(actions.words, stage.name)}
        </h3>
      </DialogTitle>
      <Actions {...actions} />
    </DialogHeader>
  );
}
