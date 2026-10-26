'use client';

import { useProgress, type Progress, type ProgressStatus } from '@/hooks/use-progress';
import { progressFile } from '@/lib/progress.pure';
import { useCallback, useMemo, useReducer, type Dispatch } from 'react';
import { DiagramPart } from './diagram-part';
import {
  callbacksFor,
  progressTarget,
  progressUploadEvent,
  shownWorkflow,
  slicesOf,
} from './human-in-the-loop-slices.pure';
import type { HumanInTheLoopData, ProgressActions, ProgressNote } from './human-in-the-loop.types';
import { ModalPart } from './modal-part.client';
import { saveFile } from './save-file';
import { ToolbarPart } from './toolbar-part.client';
import { createState, reduce, type WorkflowEvent, type WorkflowState } from './workflow-state.pure';
import { workflowView } from './workflow-view.pure';

/*
 * The visual's one client parent: it owns the state and hands each part its slice and callbacks (FE-012 §4). A part
 * never gets `state` or `dispatch`. Filling a part means editing its own file, never this contract.
 */

/** The note for a status that needs the viewer; the download holds the entry `kept`. */
function noteFor(status: ProgressStatus, handlers: Omit<ProgressNote, 'kind'>): ProgressNote | null {
  return status === 'stale' || status === 'unsaved' ? { kind: status, ...handlers } : null;
}

/** Save and load of the run of the shown authored Workflow; none for an uploaded one. */
function actionsOf(
  data: HumanInTheLoopData,
  state: WorkflowState,
  dispatch: Dispatch<WorkflowEvent>,
): ProgressActions | null {
  const target = progressTarget(data, state);
  if (!target) return null;
  const shown = { ...target, title: shownWorkflow(data, state)?.title ?? '' };
  const { slotValues: results, teaching } = state;
  return {
    onDownload: () => saveFile(progressFile(target.id, { hash: target.hash, results, teaching })),
    onUpload: (text) => dispatch(progressUploadEvent(text, shown, data.words)),
  };
}

/**
 * Saves the run of an authored Workflow and resumes it, and offers it as a YAML file to save and load. An uploaded
 * Workflow's run is not kept, so it has neither (decision of #382: no hash can vouch for a file the site does not hold).
 */
function useSavedProgress(data: HumanInTheLoopData, state: WorkflowState, dispatch: Dispatch<WorkflowEvent>) {
  const target = progressTarget(data, state);
  const { slotValues: results, teaching } = state;
  const progress = useMemo<Progress>(() => ({ results, teaching }), [results, teaching]);
  const onResume = useCallback((saved: Progress) => dispatch({ type: 'restore', ...saved }), [dispatch]);
  const key = target?.key ?? null;
  const { status, kept, discard } = useProgress({ key, hash: target?.hash ?? '', progress, onResume });
  const onDownload = () => target && saveFile(progressFile(target.id, kept));
  const actions = actionsOf(data, state, dispatch);
  return { note: noteFor(status, { onDownload, onDiscard: discard }), actions };
}

export function HumanInTheLoopClient(data: HumanInTheLoopData) {
  const start = { workflowId: data.workflowId, level: data.level };
  const [state, dispatch] = useReducer(reduce, start, createState);
  const on = useMemo(() => callbacksFor(dispatch), []);
  const workflow = shownWorkflow(data, state);
  const { level } = state;
  const { note, actions } = useSavedProgress(data, state, dispatch);
  const view = useMemo(() => workflow && workflowView(workflow, { level }), [workflow, level]);
  if (!workflow || !view) return null;
  const slices = slicesOf({ data, state, workflow, note, progress: actions, view }, on);
  return (
    <div data-human-in-the-loop={workflow.id} data-level={state.level}>
      <ToolbarPart {...slices.toolbar} />
      <DiagramPart {...slices.diagram} />
      <ModalPart {...slices.modal} />
    </div>
  );
}
