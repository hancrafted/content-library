import { openEpisode, type Polled } from '@/lib/dashboard-reader.pure';
import type { EpisodeFolder } from '@/lib/episode-folder.pure';
import { useEffect, useRef, useState } from 'react';
import { fileSystemFolder, type DirectoryHandle } from './file-system-folder';
import { useEpisodeOutputs } from './use-episode-outputs';

type PickerWindow = Window & { showDirectoryPicker?: (options: { mode: 'read' }) => Promise<DirectoryHandle> };
type Selection = { folder: EpisodeFolder } & Awaited<ReturnType<typeof openEpisode>>;

async function pickEpisode(): Promise<Selection | null> {
  const picker = (window as PickerWindow).showDirectoryPicker;
  if (picker === undefined) throw new Error('This page needs Chrome or Edge with local folder access.');
  try {
    const folder = fileSystemFolder(await picker.call(window, { mode: 'read' }));
    return { folder, ...(await openEpisode(folder, Date.now)) };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null;
    throw error;
  }
}

function useFolderSelection() {
  const [selection, setSelection] = useState<Selection>();
  const [choosing, setChoosing] = useState(false);
  const [error, setError] = useState<string>();
  const request = useRef(0);
  useEffect(
    () => () => {
      request.current += 1;
    },
    [],
  );
  const choose = async () => {
    const id = ++request.current;
    setChoosing(true);
    setError(undefined);
    try {
      const selected = await pickEpisode();
      if (request.current === id && selected !== null) setSelection(selected);
    } catch (cause) {
      if (request.current === id) setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      if (request.current === id) setChoosing(false);
    }
  };
  return { selection, choosing, error, choose };
}

function useEpisodePolling(selection: Selection | undefined): Polled | undefined {
  const [observed, setObserved] = useState<Polled & { selection: Selection }>();
  useEffect(() => {
    if (selection === undefined) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      const polled = await selection.reader.poll();
      if (cancelled) return;
      setObserved({ selection, ...polled });
      timer = setTimeout(tick, 2000);
    };
    timer = setTimeout(tick, 2000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [selection]);
  return observed?.selection === selection ? observed : selection?.initial;
}

/** Folder handles, source data and errors are transient; a reload returns to the picker. */
export function useEpisodeDashboard() {
  const picker = useFolderSelection();
  const polled = useEpisodePolling(picker.selection);
  const outputs = useEpisodeOutputs(picker.selection?.folder, polled?.read);
  const [supported, setSupported] = useState<boolean | null>(null);
  useEffect(() => {
    setSupported(typeof (window as PickerWindow).showDirectoryPicker === 'function');
  }, []);
  return { ...picker, polled, outputs, supported, name: picker.selection?.folder.name };
}
