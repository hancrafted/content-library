import { createEpisodeReader, type EpisodeRead } from '@/lib/dashboard-reader.pure';
import { useEffect, useRef, useState } from 'react';
import { useEpisodeOutputs, type OutputFolder } from './use-episode-outputs';

type PickerWindow = Window & { showDirectoryPicker?: (options: { mode: 'read' }) => Promise<OutputFolder> };
interface Selection {
  folder: OutputFolder;
  reader: ReturnType<typeof createEpisodeReader>;
  initial: EpisodeRead;
  /** When the initial read finished, epoch milliseconds. */
  readAt: number;
}

async function pickEpisode(): Promise<Selection | null> {
  const picker = (window as PickerWindow).showDirectoryPicker;
  if (picker === undefined) throw new Error('This page needs Chrome or Edge with local folder access.');
  try {
    const folder = await picker.call(window, { mode: 'read' });
    const reader = createEpisodeReader(folder);
    const initial = await reader.poll();
    if (initial.pipeline === undefined) throw new Error(initial.errors.join('\n'));
    return { folder, reader, initial, readAt: Date.now() };
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

function useEpisodePolling(selection: Selection | undefined) {
  const [observed, setObserved] = useState<{ selection: Selection; read: EpisodeRead; readAt: number }>();
  useEffect(() => {
    if (selection === undefined) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      const read = await selection.reader.poll();
      if (cancelled) return;
      setObserved({ selection, read, readAt: Date.now() });
      timer = setTimeout(tick, 2000);
    };
    timer = setTimeout(tick, 2000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [selection]);
  return observed?.selection === selection
    ? observed
    : selection && { read: selection.initial, readAt: selection.readAt };
}

/** Folder handles, source data and errors are transient; a reload returns to the picker. */
export function useEpisodeDashboard() {
  const picker = useFolderSelection();
  const polled = useEpisodePolling(picker.selection);
  const read = polled?.read;
  const outputs = useEpisodeOutputs(picker.selection?.folder, read);
  const [supported, setSupported] = useState<boolean | null>(null);
  useEffect(() => {
    setSupported(typeof (window as PickerWindow).showDirectoryPicker === 'function');
  }, []);
  return { ...picker, read, readAt: polled?.readAt, outputs, supported, name: picker.selection?.folder.name };
}
