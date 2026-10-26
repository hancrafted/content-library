'use client';

import { DialogClose, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CircleHelp, Code, X } from 'lucide-react';
import type { UiWords } from './human-in-the-loop.types';
import { ToolButton } from './tool-button.client';
import { tryTitle } from './words.pure';
import type { Level } from './workflow-state.pure';
import type { StageView } from './workflow-view.pure';

interface HeaderProps {
  readonly stage: StageView;
  readonly words: UiWords;
  readonly level: Level;
  readonly onLevel: (level: Level) => void;
  readonly showContext: boolean;
  readonly onContext: (show: boolean) => void;
}

function Actions({ words, level, onLevel, showContext, onContext }: Omit<HeaderProps, 'stage'>) {
  const technical = level === 'technical';
  return (
    <div className="flex shrink-0 items-center gap-2">
      <ToolButton
        label={words.context}
        tip={words.contextTip}
        pressed={showContext}
        text
        onClick={() => onContext(!showContext)}
      >
        <CircleHelp aria-hidden="true" />
      </ToolButton>
      <ToolButton
        label={words.technical}
        tip={words.technicalTip}
        pressed={technical}
        onClick={() => onLevel(technical ? 'simple' : 'technical')}
      >
        <Code aria-hidden="true" />
      </ToolButton>
      <DialogClose asChild>
        <ToolButton label={words.close}>
          <X aria-hidden="true" />
        </ToolButton>
      </DialogClose>
    </div>
  );
}

/** The title at the left; at the right the info and simple/technical toggles beside Close. */
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
