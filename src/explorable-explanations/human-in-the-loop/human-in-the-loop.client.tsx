'use client';

import { useProgress, type Progress, type ProgressStatus } from '@/shared/hooks/use-progress';
import { useSearch } from '@/shared/hooks/use-search';
import { progressFile } from '@/shared/lib/progress-file.pure';
import { useCallback, useMemo, useReducer, useState, type Dispatch } from 'react';
import { debugAvailable } from './debug-footer.pure';
import { DiagramPart } from './diagram-part';
import {
  callbacksFor,
  progressTarget,
  progressUploadEvent,
  shownWorkflow,
  slicesOf,
} from './human-in-the-loop-slices.pure';
import type { HumanInTheLoopData } from './human-in-the-loop.types';
import { ModalPart } from './modal-part.client';
import type { ProgressActions, ProgressNote } from './progress-controls.types';
import { saveFile } from './save-file';
import { ToolbarPart } from './toolbar-part.client';
import { roundsOf, runOf } from './workflow-run.pure';
import { createState, reduce, type View, type WorkflowEvent, type WorkflowState } from './workflow-state.pure';
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
  const { status, kept, discard, reset } = useProgress({ key, hash: target?.hash ?? '', progress, onResume });
  const onDownload = () => target && saveFile(progressFile(target.id, kept));
  const actions = actionsOf(data, state, dispatch);
  return { note: noteFor(status, { onDownload, onDiscard: discard }), actions, resetSaved: reset };
}

function useViewOf(workflow: ReturnType<typeof shownWorkflow>, state: WorkflowState) {
  const { level, teaching, slotValues } = state;
  const rounds = useMemo(
    () => (workflow ? JSON.stringify(roundsOf(runOf(workflow.file, { results: slotValues, teaching }))) : '{}'),
    [workflow, slotValues, teaching],
  );
  return useMemo(
    () => workflow && workflowView(workflow, { level, teaching, rounds: JSON.parse(rounds) as Record<string, number> }),
    [workflow, level, teaching, rounds],
  );
}

/** The callbacks over one dispatch, with what the parent does besides: Reset empties storage, a view change starts the crossfade. */
function useCallbacksOf(dispatch: Dispatch<WorkflowEvent>, resetSaved: () => void) {
  const [viewChanged, setViewChanged] = useState(false);
  const on = useMemo(() => {
    const callbacks = callbacksFor(dispatch);
    return {
      ...callbacks,
      onView: (view: View) => {
        setViewChanged(true);
        callbacks.onView(view);
      },
      onReset: () => {
        resetSaved();
        callbacks.onReset();
      },
    };
  }, [dispatch, resetSaved]);
  return { on, viewChanged };
}

export function HumanInTheLoopClient(data: HumanInTheLoopData) {
  const start = { workflowId: data.workflowId, level: data.level, view: data.view };
  const [state, dispatch] = useReducer(reduce, start, createState);
  const { note, actions, resetSaved } = useSavedProgress(data, state, dispatch);
  const { on, viewChanged } = useCallbacksOf(dispatch, resetSaved);
  const search = useSearch();
  const available = debugAvailable({ env: process.env.NODE_ENV, search });
  const workflow = shownWorkflow(data, state);
  const view = useViewOf(workflow, state);
  if (!workflow || !view) return null;
  const slices = slicesOf({ data, state, workflow, note, progress: actions, view, debugAvailable: available }, on);
  return (
    <div data-human-in-the-loop={workflow.id} data-level={state.level} data-view={state.view}>
      <ToolbarPart {...slices.toolbar} />
      <div key={state.view} data-view-fade={viewChanged ? 'on' : 'off'}>
        <DiagramPart {...slices.diagram} />
      </div>
      <ModalPart {...slices.modal} />
    </div>
  );
}
