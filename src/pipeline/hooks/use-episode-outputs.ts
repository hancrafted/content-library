import { readOutput, writtenOutputs, type EpisodeOutputs } from '@/pipeline/lib/dashboard-outputs.pure';
import type { EpisodeRead } from '@/pipeline/lib/dashboard-reader.pure';
import type { EpisodeFolder } from '@/pipeline/lib/episode-folder.pure';
import { useEffect, useState } from 'react';

const REVOKE_AFTER_MILLISECONDS = 60_000;

function openAsText(text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  window.open(url, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_AFTER_MILLISECONDS);
}

const sameSet = (a: ReadonlySet<string>, b: ReadonlySet<string>) => a.size === b.size && [...a].every((x) => b.has(x));

export function useEpisodeOutputs(folder: EpisodeFolder | undefined, read: EpisodeRead | undefined): EpisodeOutputs {
  const [written, setWritten] = useState<ReadonlySet<string>>(() => new Set());
  useEffect(() => {
    if (folder === undefined || read?.pipeline === undefined) return;
    let cancelled = false;
    void writtenOutputs(folder, read.pipeline.jobs).then((next) => {
      if (cancelled) return;
      setWritten((current) => (sameSet(current, next) ? current : next));
    });
    return () => {
      cancelled = true;
    };
  }, [folder, read]);
  const open = (output: string) => {
    if (folder === undefined) return;
    void readOutput(folder, output).then((text) => {
      if (text !== null) return openAsText(text);
      setWritten((current) => new Set([...current].filter((other) => other !== output)));
    });
  };
  return { written, open };
}
