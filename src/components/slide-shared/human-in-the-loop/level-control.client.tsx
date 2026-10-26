'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { UiWords } from './human-in-the-loop.types';
import { levelOptions, type LevelOption } from './level-options.pure';
import type { Level } from './workflow-state.pure';

interface LevelControlProps {
  readonly words: UiWords;
  readonly level: Level;
  readonly onLevel: (level: Level) => void;
}

function Segment({
  option,
  on,
  onPick,
}: {
  readonly option: LevelOption;
  readonly on: boolean;
  readonly onPick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-pressed={on}
          data-level-option={option.level}
          onClick={onPick}
          className={cn(
            'h-full cursor-pointer rounded-full px-3 text-caption font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50',
            on ? 'bg-primary text-primary-foreground' : 'text-foreground/70 hover:text-foreground',
          )}
        >
          {option.label}
        </button>
      </TooltipTrigger>
      <TooltipContent>{option.tip}</TooltipContent>
    </Tooltip>
  );
}

/** The two-way "Chat · CLI" segmented control: one pressed segment at a time, named by `words.level`. */
export function LevelControl({ words, level, onLevel }: LevelControlProps) {
  return (
    <div
      role="group"
      aria-label={words.level}
      data-control="level"
      className="inline-flex h-9 items-center rounded-full border bg-background p-[3px]"
    >
      {levelOptions(words).map((option) => (
        <Segment key={option.level} option={option} on={option.level === level} onPick={() => onLevel(option.level)} />
      ))}
    </div>
  );
}
