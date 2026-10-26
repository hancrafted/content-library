import { readProgress, removeProgress, writeProgress } from '@/lib/prefs-storage';
import { verdictOf, type ProgressEntry } from '@/lib/progress.pure';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from 'react';

/** What the viewer's work is, apart from the hash the hook adds. */
export type Progress = Omit<ProgressEntry, 'hash'>;

/**
 * `loading`: not read yet (the static page cannot know); `saved`: in step with storage; `unsaved`: storage refused the
 * last write; `stale`: an entry of an edited source waits for a choice and nothing is written meanwhile.
 */
export type ProgressStatus = 'loading' | 'saved' | 'unsaved' | 'stale';

interface Options {
  /** The hands-on's key, or null when its run is not kept (an uploaded Workflow). */
  readonly key: string | null;
  /** The hash of the hands-on's source as it is now. */
  readonly hash: string;
  /** The run as the page holds it. */
  readonly progress: Progress;
  /** Called once on load with a stored run of the same hash. */
  readonly onResume: (progress: Progress) => void;
}

interface Loaded {
  readonly key: string;
  readonly hash: string;
  /** The entry of an edited source, kept in storage until the viewer chooses. */
  readonly stale: ProgressEntry | undefined;
}

/** The last run known to be in storage, as text; null forces the next write. */
type Saved = MutableRefObject<string | null>;

/** What the three effects share: which entry they work on, what is known to be stored there, and whether a write was refused. */
interface Store {
  readonly key: string | null;
  readonly hash: string;
  readonly saved: Saved;
  readonly setRefused: Dispatch<SetStateAction<boolean>>;
}

/** The run of a viewer who has pasted nothing and not touched teaching mode. */
const EMPTY: Progress = { results: {}, teaching: true };

const signature = (progress: Progress): string => JSON.stringify(progress);

/** Reads the entry of `key` when it or its hash changes, resumes a matching one, and says what was found. */
function useLoad({ progress, onResume }: Options, { key, hash, saved, setRefused }: Store) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const latest = useRef({ progress, onResume });
  useEffect(() => {
    latest.current = { progress, onResume };
  });
  useEffect(() => {
    if (key === null) return;
    const entry = readProgress(key);
    const verdict = verdictOf(entry, hash);
    saved.current = signature(verdict === 'resume' && entry ? entry : latest.current.progress);
    if (verdict === 'resume' && entry) latest.current.onResume(entry);
    setRefused(false);
    setLoaded({ key, hash, stale: verdict === 'stale' ? entry : undefined });
  }, [key, hash, saved, setRefused]);
  return [loaded, setLoaded] as const;
}

/** Writes the run to storage when it differs from what is there, never while an old entry waits for a choice. */
function useSave({ progress, active }: { readonly progress: Progress; readonly active: boolean }, store: Store) {
  const { key, hash, saved, setRefused } = store;
  useEffect(() => {
    if (!active || key === null) return;
    const now = signature(progress);
    if (now === saved.current) return;
    const ok = writeProgress(key, { hash, ...progress });
    if (ok) saved.current = now;
    setRefused(!ok);
  }, [active, key, hash, progress, saved, setRefused]);
}

function statusOf(loaded: boolean, stale: boolean, refused: boolean): ProgressStatus {
  if (!loaded) return 'loading';
  if (stale) return 'stale';
  return refused ? 'unsaved' : 'saved';
}

/** `discard` forgets an old entry; `reset` clears the viewer's own run. Both remove the entry and let the page carry on. */
function useClear({ key, hash, saved, setRefused }: Store, setLoaded: (loaded: Loaded) => void) {
  /** `next` is what the page then holds, so it is not written straight back. */
  const clear = useCallback(
    (next: Progress | null) => {
      if (key === null) return;
      removeProgress(key);
      saved.current = next && signature(next);
      setRefused(false);
      setLoaded({ key, hash, stale: undefined });
    },
    [key, hash, saved, setLoaded, setRefused],
  );
  const discard = useCallback(() => clear(null), [clear]);
  const reset = useCallback(() => clear(EMPTY), [clear]);
  return { discard, reset };
}

/**
 * Saves one hands-on's run under the progress key and resumes it after a reload, another Episode or the other language
 * (FE-001 §3). An entry whose hash differs never loads: a fresh run starts and the old entry waits for `discard` or a
 * download. Returns the entry a download should hold, `discard` for an old entry and `reset` for the viewer's own run.
 */
export function useProgress(options: Options) {
  const { key, hash, progress } = options;
  const saved: Saved = useRef(null);
  const [refused, setRefused] = useState(false);
  const store: Store = { key, hash, saved, setRefused };
  const [loaded, setLoaded] = useLoad(options, store);
  const ready = key !== null && loaded?.key === key && loaded.hash === hash;
  const stale = ready ? loaded.stale : undefined;
  useSave({ progress, active: ready && !stale }, store);

  const { discard, reset } = useClear(store, setLoaded);

  return {
    status: statusOf(ready, stale !== undefined, refused),
    kept: stale ?? { hash, ...progress },
    discard,
    reset,
  };
}
