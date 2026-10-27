'use client';

import { Button } from '@/shared/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/lib/utils';
import type { ComponentProps, ReactNode } from 'react';

/** The pill a toolbar's controls sit in: the visual's and the popover's alike. */
export const TOOLBAR_PILL = 'flex w-fit max-w-full flex-wrap items-center gap-0.5 rounded-full border bg-muted p-[3px]';

/** The row of a toolbar pill and Reset after it, set apart from the pill's controls. */
export const TOOLBAR_ROW = 'flex flex-wrap items-center gap-x-4 gap-y-2';

interface ToolButtonProps extends Omit<ComponentProps<typeof Button>, 'aria-label'> {
  /** The accessible name and, unless `tip` says more, the tooltip. */
  readonly label: string;
  readonly tip?: string;
  readonly pressed?: boolean;
  /** Shows the label beside the icon, as a pill. */
  readonly text?: boolean;
  readonly children: ReactNode;
}

/** A round icon button with a shadcn tooltip; `pressed` fills it for a toggle that is on. */
export function ToolButton({ label, tip = label, pressed, text, className, children, ...rest }: ToolButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size={text ? 'default' : 'icon'}
          aria-label={label}
          aria-pressed={pressed}
          className={cn(
            'h-9 rounded-full',
            !text && 'size-9',
            pressed &&
              'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground dark:bg-primary dark:hover:bg-primary/90',
            className,
          )}
          {...rest}
        >
          {children}
          {text && label}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tip}</TooltipContent>
    </Tooltip>
  );
}
