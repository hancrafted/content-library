import { readProgress, removeProgress, writeProgress } from '@/shared/lib/prefs-storage';
import { normalizedEntry, verdictOf, type ProgressEntry } from '@/shared/lib/progress.pure';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from 'react';

export type Progress = Omit<ProgressEntry, 'hash'>;

export type ProgressStatus = 'loading' | 'saved' | 'unsaved' | 'stale';

interface Options {
  readonly key: string | null;
  readonly hash: string;
  readonly progress: Progress;
  readonly onResume: (progress: Progress) => void;
}

interface Loaded {
  readonly key: string;
  readonly hash: string;
  readonly stale: ProgressEntry | undefined;
}

type Saved = MutableRefObject<string | null>;

interface Store {
  readonly key: string | null;
  readonly hash: string;
  readonly saved: Saved;
  readonly setRefused: Dispatch<SetStateAction<boolean>>;
}

const EMPTY: Progress = { results: {}, demo: true, prompts: {} };

const signature = (progress: Progress): string => JSON.stringify(normalizedEntry(progress));

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

function useSave({ progress, active }: { readonly progress: Progress; readonly active: boolean }, store: Store) {
  const { key, hash, saved, setRefused } = store;
  useEffect(() => {
    if (!active || key === null) return;
    const now = signature(progress);
    if (now === saved.current) return;
    const ok = writeProgress(key, normalizedEntry({ hash, ...progress }));
    if (ok) saved.current = now;
    setRefused(!ok);
  }, [active, key, hash, progress, saved, setRefused]);
}

function statusOf(loaded: boolean, stale: boolean, refused: boolean): ProgressStatus {
  if (!loaded) return 'loading';
  if (stale) return 'stale';
  return refused ? 'unsaved' : 'saved';
}

function useClear({ key, hash, saved, setRefused }: Store, setLoaded: (loaded: Loaded) => void) {
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

// decision: FE-001 §3
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
