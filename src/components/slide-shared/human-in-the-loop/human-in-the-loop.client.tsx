'use client';

import { useMemo, useReducer } from 'react';
import { DiagramPart } from './diagram-part';
import { callbacksFor, shownWorkflow, slicesOf } from './human-in-the-loop-slices.pure';
import type { HumanInTheLoopData } from './human-in-the-loop.types';
import { ModalPart } from './modal-part.client';
import { ToolbarPart } from './toolbar-part.client';
import { roundsOf, runOf } from './workflow-run.pure';
import { createState, reduce } from './workflow-state.pure';
import { workflowView } from './workflow-view.pure';

/*
 * The visual's one client parent: it owns the state and hands each part its slice and callbacks (FE-012 §4). A part
 * never gets `state` or `dispatch`. Filling a part means editing its own file, never this contract.
 */

export function HumanInTheLoopClient(data: HumanInTheLoopData) {
  const start = { workflowId: data.workflowId, level: data.level };
  const [state, dispatch] = useReducer(reduce, start, createState);
  const on = useMemo(() => callbacksFor(dispatch), []);
  const workflow = shownWorkflow(data, state);
  const { level, teaching, slotValues } = state;
  const rounds = useMemo(
    () => (workflow ? JSON.stringify(roundsOf(runOf(workflow.file, { results: slotValues, teaching }))) : '{}'),
    [workflow, slotValues, teaching],
  );
  const view = useMemo(
    () => workflow && workflowView(workflow, { level, teaching, rounds: JSON.parse(rounds) as Record<string, number> }),
    [workflow, level, teaching, rounds],
  );
  if (!workflow || !view) return null;
  const slices = slicesOf({ data, state, workflow, view }, on);
  return (
    <div data-human-in-the-loop={workflow.id} data-level={state.level}>
      <ToolbarPart {...slices.toolbar} />
      <DiagramPart {...slices.diagram} />
      <ModalPart {...slices.modal} />
    </div>
  );
}
