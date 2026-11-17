'use client';

import { Button } from '@/shared/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/lib/utils';
import type { ComponentProps, ReactNode } from 'react';

export const TOOLBAR_PILL = 'flex w-fit max-w-full flex-wrap items-center gap-0.5 rounded-full border bg-muted p-[3px]';

export const TOOLBAR_ROW = 'flex flex-wrap items-center gap-x-4 gap-y-2';

interface ToolButtonProps extends Omit<ComponentProps<typeof Button>, 'aria-label'> {
  readonly label: string;
  readonly tip?: string;
  readonly pressed?: boolean;
  readonly text?: boolean;
  readonly children: ReactNode;
}

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
