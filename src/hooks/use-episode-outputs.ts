import { outputSegments, type EpisodeOutputs } from '@/lib/dashboard-outputs.pure';
import type { EpisodeFolder, EpisodeRead } from '@/lib/dashboard-reader.pure';
import { useEffect, useState } from 'react';

/** The chosen Episode folder's handle: the reader's files plus the sub-folders an output path walks. */
export interface OutputFolder extends EpisodeFolder {
  getDirectoryHandle(name: string): Promise<OutputFolder>;
}

/** How long a new tab has to load an output before its object URL is revoked. */
const REVOKE_AFTER_MS = 60_000;

async function outputFile(folder: OutputFolder, output: string) {
  const segments = outputSegments(output, folder.name);
  if (segments === null) return null;
  let directory = folder;
  for (const name of segments.slice(0, -1)) directory = await directory.getDirectoryHandle(name);
  return (await directory.getFileHandle(segments.at(-1)!)).getFile();
}

async function isWritten(folder: OutputFolder, output: string): Promise<boolean> {
  try {
    return (await outputFile(folder, output)) !== null;
  } catch {
    return false;
  }
}

async function openAsText(folder: OutputFolder, output: string): Promise<boolean> {
  try {
    const file = await outputFile(folder, output);
    if (file === null) return false;
    const url = URL.createObjectURL(new Blob([await file.text()], { type: 'text/plain;charset=utf-8' }));
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), REVOKE_AFTER_MS);
    return true;
  } catch {
    return false;
  }
}

const sameSet = (a: ReadonlySet<string>, b: ReadonlySet<string>) => a.size === b.size && [...a].every((x) => b.has(x));

/**
 * Probes each output of the pipeline after every poll, so a file an agent writes turns into a link, and opens one
 * read-only in a new tab as plain text. Reads only; the folder handle never leaves page memory.
 */
export function useEpisodeOutputs(folder: OutputFolder | undefined, read: EpisodeRead | undefined): EpisodeOutputs {
  const [written, setWritten] = useState<ReadonlySet<string>>(() => new Set());
  useEffect(() => {
    if (folder === undefined || read?.pipeline === undefined) return;
    let cancelled = false;
    const outputs = [...new Set(read.pipeline.jobs.flatMap((job) => job.outputs))];
    void Promise.all(outputs.map((output) => isWritten(folder, output))).then((found) => {
      if (cancelled) return;
      const next = new Set(outputs.filter((_, at) => found[at]));
      setWritten((current) => (sameSet(current, next) ? current : next));
    });
    return () => {
      cancelled = true;
    };
  }, [folder, read]);
  const open = (output: string) => {
    if (folder === undefined) return;
    void openAsText(folder, output).then((opened) => {
      if (opened) return;
      setWritten((current) => new Set([...current].filter((other) => other !== output)));
    });
  };
  return { written, open };
}
