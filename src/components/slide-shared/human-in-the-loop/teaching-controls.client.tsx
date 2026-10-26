'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import type { UiWords } from './human-in-the-loop.types';
import type { TeachingProps } from './progress-controls.types';

/*
 * The teaching switch and Reset, side by side in the toolbar and at the popover's top right. The switch is disabled once
 * a result is pasted ("Reset to change"). Reset takes the warning token colour while saved work exists; it asks for
 * confirmation in the page (never a browser dialog), where the viewer may download the run first.
 */

export interface Props extends TeachingProps {
  readonly words: UiWords;
  /** Whether the confirmation is open; the part that holds the controls holds it. */
  readonly confirming: boolean;
  readonly onConfirming: (open: boolean) => void;
}

function TeachingSwitch({ words, teaching, onTeaching }: Props) {
  const { on, locked } = teaching;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* A span carries the tooltip: a disabled button fires no pointer events. */}
        <span tabIndex={locked ? 0 : -1} className="inline-flex">
          <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label={words.teaching}
            disabled={locked}
            data-control="teaching"
            data-state={on ? 'on' : 'off'}
            onClick={() => onTeaching(!on)}
            className={cn(
              'inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border bg-background px-3 text-caption font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60',
              on && 'bg-primary text-primary-foreground',
            )}
          >
            {words.teaching}
          </button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{locked ? words.teachingLocked : words.teachingTip}</TooltipContent>
    </Tooltip>
  );
}

function ResetButton({ words, teaching, confirming, onConfirming }: Props) {
  const { hasWork } = teaching;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label={words.reset}
          aria-expanded={confirming}
          data-control="reset"
          data-has-work={hasWork}
          onClick={() => onConfirming(!confirming)}
          className={cn('h-9 rounded-full', hasWork && 'border-(--warning) text-(--warning) hover:text-(--warning)')}
        >
          <RotateCcw aria-hidden="true" />
          {words.reset}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{hasWork ? words.resetTip : words.reset}</TooltipContent>
    </Tooltip>
  );
}

/** The switch and Reset, each only if the Preset shows it. */
export function TeachingControls(props: Props) {
  const { show, resetShow } = props.teaching;
  return (
    <>
      {show && <TeachingSwitch {...props} />}
      {resetShow && <ResetButton {...props} />}
    </>
  );
}

/** The confirmation state of a part that holds the controls, with the props the controls and the question share. */
export function useTeachingProps(words: UiWords, props: TeachingProps): Props {
  const [confirming, onConfirming] = useState(false);
  return { words, ...props, confirming, onConfirming };
}

function ConfirmButtons({ words, onDownloadRun, onReset, onConfirming }: Props) {
  return (
    <>
      {onDownloadRun && (
        <Button type="button" variant="outline" size="sm" onClick={onDownloadRun}>
          {words.resetDownload}
        </Button>
      )}
      <Button
        type="button"
        size="sm"
        data-reset-now=""
        onClick={() => {
          onReset();
          onConfirming(false);
        }}
      >
        {words.resetNow}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => onConfirming(false)}>
        {words.resetCancel}
      </Button>
    </>
  );
}

/** The question under the controls: download first, reset now, or cancel. Closes itself after either choice but Download. */
export function ResetConfirm(props: Props) {
  const { words, teaching, confirming } = props;
  if (!confirming || !teaching.resetShow) return null;
  return (
    <div
      role="alert"
      data-reset-confirm=""
      className="flex flex-wrap items-center gap-2 rounded-md border border-(--warning) px-3 py-2 text-body"
    >
      <p className="min-w-0 flex-1">{words.resetConfirm}</p>
      <ConfirmButtons {...props} />
    </div>
  );
}
