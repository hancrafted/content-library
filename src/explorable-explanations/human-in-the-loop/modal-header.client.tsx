'use client';

import { DialogClose, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { CircleHelp, X } from 'lucide-react';
import type { UiWords } from './human-in-the-loop.types';
import { LevelControl } from './level-control.client';
import type { TeachingProps } from './progress-controls.types';
import { Reset, TeachingToggle } from './teaching-controls.client';
import { TOOLBAR_PILL, TOOLBAR_ROW, ToolButton } from './tool-button.client';
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

/** The toolbar under the title, one pill as the visual's: Help, Chat · CLI, the teaching switch; Reset set apart after it. */
function Toolbar(props: Omit<HeaderProps, 'stage'>) {
  const { words, level, onLevel, showContext, onContext } = props;
  return (
    <div className={TOOLBAR_ROW}>
      <div role="toolbar" aria-label={words.toolbar} data-part="modal-toolbar" className={TOOLBAR_PILL}>
        <ToolButton
          label={words.context}
          tip={words.contextTip}
          pressed={showContext}
          text
          variant="ghost"
          onClick={() => onContext(!showContext)}
        >
          <CircleHelp aria-hidden="true" />
        </ToolButton>
        <LevelControl words={words} level={level} onLevel={onLevel} />
        <TeachingToggle {...props} />
      </div>
      <Reset {...props} />
    </div>
  );
}

/** The title with Close alone at the top right; under them, the toolbar. */
export function ModalHeader({ stage, ...actions }: HeaderProps) {
  return (
    <div className="flex shrink-0 flex-col gap-3">
      <DialogHeader>
        <DialogTitle asChild>
          <h3 data-autofocus="" tabIndex={-1} className="text-subheading font-semibold outline-none">
            {tryTitle(actions.words, stage.name)}
          </h3>
        </DialogTitle>
        <DialogClose asChild>
          <ToolButton label={actions.words.close}>
            <X aria-hidden="true" />
          </ToolButton>
        </DialogClose>
      </DialogHeader>
      <Toolbar {...actions} />
    </div>
  );
}
