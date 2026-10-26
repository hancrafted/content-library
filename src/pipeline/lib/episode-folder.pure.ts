/*
 * The Episode folder the dashboard reads: `docs/episodes/<slug>`, addressed by paths inside it ('/'-separated).
 * Read-only and small on purpose — the poll step and the output probe need text, bytes from an offset, size and
 * modification time, and whether a file is there. Two adapters: the browser's File System Access handle (under
 * src/shared/hooks/, it touches the DOM) and the in-memory folder below, which tests and stand-ins drive.
 */

export interface FileStat {
  size: number;
  lastModified: number;
}

/** Every read of a missing file rejects with an Error named `NotFoundError`, as the browser's handles do. */
export interface EpisodeFolder {
  readonly name: string;
  stat(path: string): Promise<FileStat>;
  readText(path: string): Promise<string>;
  readBytes(path: string, start: number): Promise<Uint8Array>;
  exists(path: string): Promise<boolean>;
}

function notFound(path: string): Error {
  return Object.assign(new Error(`${path} not found.`), { name: 'NotFoundError' });
}

export interface MemoryFolder extends EpisodeFolder {
  /** Writes a file; without a modification time a rewrite counts as one modification later. */
  write(path: string, content: string, lastModified?: number): void;
  remove(path: string): void;
}

export function createMemoryFolder(name: string, files: Record<string, string> = {}): MemoryFolder {
  const entries = new Map<string, { bytes: Uint8Array; lastModified: number }>();
  const entry = async (path: string) => entries.get(path) ?? Promise.reject(notFound(path));
  const folder: MemoryFolder = {
    name,
    write(path, content, lastModified) {
      const modified = lastModified ?? (entries.get(path)?.lastModified ?? 0) + 1;
      entries.set(path, { bytes: new TextEncoder().encode(content), lastModified: modified });
    },
    remove: (path) => void entries.delete(path),
    stat: async (path) => entry(path).then(({ bytes, lastModified }) => ({ size: bytes.length, lastModified })),
    readText: async (path) => new TextDecoder().decode((await entry(path)).bytes),
    readBytes: async (path, start) => (await entry(path)).bytes.slice(start),
    exists: async (path) => entries.has(path),
  };
  Object.entries(files).forEach(([path, content]) => folder.write(path, content));
  return folder;
}
