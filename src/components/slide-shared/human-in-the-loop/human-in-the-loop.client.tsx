'use client';

import { useProgress, type Progress, type ProgressStatus } from '@/hooks/use-progress';
import { entryFile, progressKeyOf } from '@/lib/progress.pure';
import { useCallback, useMemo, useReducer, type Dispatch } from 'react';
import { DiagramPart } from './diagram-part';
import { callbacksFor, progressTarget, shownWorkflow, slicesOf } from './human-in-the-loop-slices.pure';
import type { HumanInTheLoopData, ProgressNote } from './human-in-the-loop.types';
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

/** What the hook gives the parent: the note to show, a download of the current run, and the entry's reset. */
interface Saved {
  readonly note: ProgressNote | null;
  readonly onDownloadRun: () => void;
  readonly resetSaved: () => void;
}

/** Saves the run of an authored Workflow and resumes it; an uploaded one is not kept (its download is #382). */
function useSavedProgress(data: HumanInTheLoopData, state: WorkflowState, dispatch: Dispatch<WorkflowEvent>): Saved {
  const target = progressTarget(data, state);
  const { slotValues: results, teaching } = state;
  const progress = useMemo<Progress>(() => ({ results, teaching }), [results, teaching]);
  const onResume = useCallback((saved: Progress) => dispatch({ type: 'restore', ...saved }), [dispatch]);
  const key = target?.key ?? null;
  const hash = target?.hash ?? '';
  const { status, kept, discard, reset } = useProgress({ key, hash, progress, onResume });
  const onDownload = () => key && saveFile(entryFile(key, kept));
  const runKey = key ?? progressKeyOf(state.workflowId);
  const onDownloadRun = () => saveFile(entryFile(runKey, { hash, ...progress }));
  return { note: noteFor(status, { onDownload, onDiscard: discard }), onDownloadRun, resetSaved: reset };
}

export function HumanInTheLoopClient(data: HumanInTheLoopData) {
  const start = { workflowId: data.workflowId, level: data.level };
  const [state, dispatch] = useReducer(reduce, start, createState);
  const { note, onDownloadRun, resetSaved } = useSavedProgress(data, state, dispatch);
  const on = useMemo(() => {
    const callbacks = callbacksFor(dispatch);
    return {
      ...callbacks,
      onReset: () => {
        resetSaved();
        callbacks.onReset();
      },
    };
  }, [resetSaved]);
  const workflow = shownWorkflow(data, state);
  const { level } = state;
  const view = useMemo(() => workflow && workflowView(workflow, { level }), [workflow, level]);
  if (!workflow || !view) return null;
  const slices = slicesOf({ data, state, workflow, note, onDownloadRun, view }, on);
  return (
    <div data-human-in-the-loop={workflow.id} data-level={state.level}>
      <ToolbarPart {...slices.toolbar} />
      <DiagramPart {...slices.diagram} />
      <ModalPart {...slices.modal} />
    </div>
  );
}
