'use client';

import { Button } from '@/shared/components/ui/button';
import { useEffect } from 'react';
import type { MirrorRow, WorkflowWords } from './brief-or-pay-the-price.types';
import { prefersReducedMotion } from './reduced-motion';
import { MAX_STEP } from './workflow-annotations.pure';
import { PLAY_MILLISECONDS } from './workflow-state.pure';

const GROUP_LABEL = 'text-caption font-semibold tracking-wide text-muted-foreground uppercase';

export interface ControlsProps {
  readonly words: WorkflowWords;
  readonly step: number;
  readonly playing: boolean;
  readonly braceRows: readonly MirrorRow[];
  readonly onStep: (step: number) => void;
  readonly onPlay: () => void;
  readonly onTick: () => void;
}

function usePlaying({ playing, step, onTick }: Pick<ControlsProps, 'playing' | 'step' | 'onTick'>) {
  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(onTick, PLAY_MILLISECONDS);
    return () => window.clearTimeout(id);
  }, [playing, step, onTick]);
}

function StepButton({
  row,
  index,
  step,
  onStep,
}: Pick<ControlsProps, 'step' | 'onStep'> & {
  readonly row: MirrorRow;
  readonly index: number;
}) {
  const on = step === index + 1;
  return (
    <Button
      type="button"
      size="sm"
      variant={on ? 'default' : 'outline'}
      aria-pressed={on}
      aria-label={row.words.name}
      title={row.words.name}
      data-step-go={index + 1}
      onClick={() => onStep(index + 1)}
    >
      {row.letter}
    </Button>
  );
}

function NeighbourButton({
  label,
  go,
  disabled,
  onClick,
}: {
  readonly label: string;
  readonly go: 'previous' | 'next';
  readonly disabled: boolean;
  readonly onClick: () => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      aria-label={label}
      title={label}
      disabled={disabled}
      data-step-neighbour={go}
      onClick={onClick}
    >
      {go === 'previous' ? '‹' : '›'}
    </Button>
  );
}

function PlayButton({
  words,
  playing,
  onStep,
  onPlay,
}: Pick<ControlsProps, 'words' | 'playing' | 'onStep' | 'onPlay'>) {
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      aria-pressed={playing}
      data-play
      onClick={() => (prefersReducedMotion() ? onStep(MAX_STEP) : onPlay())}
    >
      {playing ? words.pause : words.play}
    </Button>
  );
}

function Steps({ words, step, playing, braceRows, onStep, onPlay }: ControlsProps) {
  return (
    <div role="group" aria-label={words.braceSteps} data-brace-steps className="flex flex-wrap items-center gap-2">
      <span className={GROUP_LABEL}>{words.braceSteps}</span>
      <NeighbourButton label={words.previous} go="previous" disabled={step <= 1} onClick={() => onStep(step - 1)} />
      {braceRows.map((row, index) => (
        <StepButton key={row.id} row={row} index={index} step={step} onStep={onStep} />
      ))}
      <NeighbourButton label={words.next} go="next" disabled={step >= MAX_STEP} onClick={() => onStep(step + 1)} />
      <PlayButton words={words} playing={playing} onStep={onStep} onPlay={onPlay} />
    </div>
  );
}

export const stepOf = (step: number): number => Math.max(1, Math.min(step, MAX_STEP));

function StepCaption({ words, step, braceRows }: Pick<ControlsProps, 'words' | 'step' | 'braceRows'>) {
  const row = braceRows[stepOf(step) - 1];
  return (
    <div data-step-caption aria-live="polite" className="w-full text-caption">
      {row === undefined ? null : (
        <>
          <strong>
            {row.letter} · {row.words.name}
          </strong>
          {row.words.gloss === '' ? null : (
            <>
              {' '}
              <span lang="de" data-step-gloss className="text-muted-foreground">
                ({row.words.gloss})
              </span>
            </>
          )}
          : {words.stepLines[row.id]}
        </>
      )}
    </div>
  );
}

export function WorkflowControls(props: ControlsProps) {
  usePlaying(props);
  return (
    <div data-workflow-foot className="flex flex-wrap items-center gap-x-6 gap-y-2">
      <Steps {...props} />
      <StepCaption words={props.words} step={props.step} braceRows={props.braceRows} />
    </div>
  );
}
