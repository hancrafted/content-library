'use client';

import { useProgress, type Progress, type ProgressStatus } from '@/shared/hooks/use-progress';
import { useSearch } from '@/shared/hooks/use-search';
import { progressFile } from '@/shared/lib/progress-file.pure';
import { useCallback, useMemo, useReducer, useState, type Dispatch } from 'react';
import { debugAvailable } from './debug-footer.pure';
import { DiagramPart } from './diagram-part';
import { callbacksFor, progressTarget, showWorkflow, shownWorkflow, slicesOf } from './human-in-the-loop-slices.pure';
import type { HumanInTheLoopData } from './human-in-the-loop.types';
import { ModalPart } from './modal-part.client';
import type { ProgressActions, ProgressNote } from './progress-controls.types';
import { progressUploadEvent } from './progress-upload.pure';
import { saveFile } from './save-file';
import { ToolbarPart } from './toolbar-part.client';
import { createState, reduce, type View, type WorkflowEvent, type WorkflowState } from './workflow-state.pure';

// decision: FE-012 §4
function noteFor(status: ProgressStatus, handlers: Omit<ProgressNote, 'kind'>): ProgressNote | null {
  return status === 'stale' || status === 'unsaved' ? { kind: status, ...handlers } : null;
}

function actionsOf(
  data: HumanInTheLoopData,
  state: WorkflowState,
  dispatch: Dispatch<WorkflowEvent>,
): ProgressActions | null {
  const target = progressTarget(data, state);
  if (!target) return null;
  const shown = { ...target, title: shownWorkflow(data, state)?.title ?? '' };
  const { slotValues: results, demo, prompts } = state;
  return {
    onDownload: () => saveFile(progressFile(target.id, { hash: target.hash, results, demo, prompts })),
    onUpload: (text) => dispatch(progressUploadEvent(text, shown, data.words)),
  };
}

function useSavedProgress(data: HumanInTheLoopData, state: WorkflowState, dispatch: Dispatch<WorkflowEvent>) {
  const target = progressTarget(data, state);
  const { slotValues: results, demo, prompts } = state;
  const progress = useMemo<Progress>(() => ({ results, demo, prompts }), [results, demo, prompts]);
  const onResume = useCallback((saved: Progress) => dispatch({ type: 'restore', ...saved }), [dispatch]);
  const key = target?.key ?? null;
  const { status, kept, discard, reset } = useProgress({ key, hash: target?.hash ?? '', progress, onResume });
  const onDownload = () => target && saveFile(progressFile(target.id, kept));
  const actions = actionsOf(data, state, dispatch);
  return { note: noteFor(status, { onDownload, onDiscard: discard }), actions, resetSaved: reset };
}

function useShown(data: HumanInTheLoopData, state: WorkflowState) {
  const { workflowId, uploaded, level, demo, slotValues } = state;
  return useMemo(() => {
    const workflow = shownWorkflow(data, { workflowId, uploaded });
    return workflow && showWorkflow(workflow, { level, demo, slotValues });
  }, [data, workflowId, uploaded, level, demo, slotValues]);
}

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
  const shown = useShown(data, state);
  if (!shown) return null;
  const { workflow } = shown;
  const slices = slicesOf({ ...shown, data, state, note, progress: actions, debugAvailable: available }, on);
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
