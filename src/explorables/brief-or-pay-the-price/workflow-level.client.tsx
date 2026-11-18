'use client';

import type { KeyboardEvent, MouseEvent } from 'react';
import type { MirrorRow, MoveId, TraitId, Words } from './brief-or-pay-the-price.types';
import type { Counters } from './matrix-data.pure';
import { isCounter } from './matrix-data.pure';
import type { WorkflowScenario } from './scenario.types';
import { WorkflowControls } from './workflow-controls.client';
import { WorkflowView } from './workflow-view';

export interface WorkflowLevelProps {
  readonly words: Words['workflow'];
  readonly slice: { readonly step: number; readonly playing: boolean };
  readonly counters: Counters;
  readonly braceRows: readonly MirrorRow[];
  readonly shown: WorkflowScenario;
  readonly onNode: (node: string) => void;
  readonly onStep: (step: number) => void;
  readonly onPlay: () => void;
  readonly onTick: () => void;
}

const nodeOf = (target: EventTarget): string | undefined =>
  (target as Element).closest('[data-node]')?.getAttribute('data-node') ?? undefined;

const NODE_KEYS = new Set(['Enter', ' ']);

function nodeHandlers(onNode: (node: string) => void) {
  const select = (node: string | undefined) => node !== undefined && onNode(node);
  return {
    onClick: (event: MouseEvent) => select(nodeOf(event.target)),
    onKeyDown: (event: KeyboardEvent) => {
      const node = NODE_KEYS.has(event.key) ? nodeOf(event.target) : undefined;
      if (node === undefined) return;
      event.preventDefault();
      select(node);
    },
  };
}

function Board({
  words,
  step,
  counters,
  shown,
  onNode,
}: Pick<WorkflowLevelProps, 'words' | 'counters' | 'shown' | 'onNode'> & {
  readonly step: number;
}) {
  const { scenario, words: scenarioWords } = shown;
  const shared = {
    scenario,
    words: scenarioWords,
    ui: words,
    step,
    counters: (move: MoveId, trait: TraitId) => isCounter(counters, { move, trait }),
  };
  return (
    <div data-workflow-root role="presentation" {...nodeHandlers(onNode)}>
      <div className="@3xl:hidden">
        <WorkflowView {...shared} layout={scenario.layouts.vertical} />
      </div>
      <div className="hidden @3xl:block">
        <WorkflowView {...shared} layout={scenario.layouts.horizontal} />
      </div>
    </div>
  );
}

export function WorkflowLevel({ slice, braceRows, onStep, onPlay, onTick, ...board }: WorkflowLevelProps) {
  const { words } = board;
  return (
    <>
      <Board {...board} step={slice.step} />
      <WorkflowControls
        words={words}
        step={slice.step}
        playing={slice.playing}
        braceRows={braceRows}
        onStep={onStep}
        onPlay={onPlay}
        onTick={onTick}
      />
    </>
  );
}
