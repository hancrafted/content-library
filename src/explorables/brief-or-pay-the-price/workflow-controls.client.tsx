'use client';

import { Button } from '@/shared/components/ui/button';
import { useEffect, type Dispatch } from 'react';
import type { MirrorRow, WorkflowWords } from './brief-or-pay-the-price.types';
import type { ExplorableEvent, ExplorableState } from './explorable-state.pure';
import { prefersReducedMotion } from './reduced-motion';
import { MAX_STEP } from './workflow-annotations.pure';
import { PLAY_MILLISECONDS } from './workflow-state.pure';

const GROUP_LABEL = 'text-caption font-semibold tracking-wide text-muted-foreground uppercase';

interface ControlsProps {
  readonly words: WorkflowWords;
  readonly state: Pick<ExplorableState, 'braceStep' | 'playing'>;
  readonly braceRows: readonly MirrorRow[];
  readonly dispatch: Dispatch<ExplorableEvent>;
}

function usePlaying(
  { playing, braceStep }: Pick<ExplorableState, 'playing' | 'braceStep'>,
  dispatch: ControlsProps['dispatch'],
) {
  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => dispatch({ type: 'tick' }), PLAY_MILLISECONDS);
    return () => window.clearTimeout(id);
  }, [playing, braceStep, dispatch]);
}

function StepButton({
  row,
  index,
  state,
  dispatch,
}: Pick<ControlsProps, 'state' | 'dispatch'> & { readonly row: MirrorRow; readonly index: number }) {
  const on = state.braceStep === index + 1;
  return (
    <Button
      type="button"
      size="sm"
      variant={on ? 'default' : 'outline'}
      aria-pressed={on}
      aria-label={row.words.name}
      title={row.words.name}
      data-step-go={index + 1}
      onClick={() => dispatch({ type: 'braceStep', step: index + 1 })}
    >
      {row.letter}
    </Button>
  );
}

function PlayButton({ words, state, dispatch }: Pick<ControlsProps, 'words' | 'state' | 'dispatch'>) {
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      aria-pressed={state.playing}
      data-play
      onClick={() => dispatch(prefersReducedMotion() ? { type: 'braceStep', step: MAX_STEP } : { type: 'play' })}
    >
      {state.playing ? words.pause : words.play}
    </Button>
  );
}

function Steps({ words, state, braceRows, dispatch }: ControlsProps) {
  return (
    <div role="group" aria-label={words.braceSteps} data-brace-steps className="flex flex-wrap items-center gap-2">
      <span className={GROUP_LABEL}>{words.braceSteps}</span>
      {braceRows.map((row, index) => (
        <StepButton key={row.id} row={row} index={index} state={state} dispatch={dispatch} />
      ))}
      <PlayButton words={words} state={state} dispatch={dispatch} />
    </div>
  );
}

export function WorkflowControls(props: ControlsProps) {
  usePlaying(props.state, props.dispatch);
  return (
    <div data-workflow-foot className="flex flex-wrap items-center gap-x-6 gap-y-2">
      <Steps {...props} />
    </div>
  );
}
