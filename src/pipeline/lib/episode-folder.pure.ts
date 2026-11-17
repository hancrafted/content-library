export interface FileStat {
  size: number;
  lastModified: number;
}

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
