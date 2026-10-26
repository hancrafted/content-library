'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { ComponentProps, ReactNode } from 'react';

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
