import type { EpisodeFolder } from '@/pipeline/lib/episode-folder.pure';

export interface DirectoryHandle {
  readonly name: string;
  getDirectoryHandle(name: string): Promise<DirectoryHandle>;
  getFileHandle(name: string): Promise<{ getFile(): Promise<File> }>;
}

export function fileSystemFolder(root: DirectoryHandle): EpisodeFolder {
  const file = async (path: string) => {
    const segments = path.split('/');
    let directory = root;
    for (const name of segments.slice(0, -1)) directory = await directory.getDirectoryHandle(name);
    return (await directory.getFileHandle(segments.at(-1)!)).getFile();
  };
  return {
    name: root.name,
    async stat(path) {
      const { size, lastModified } = await file(path);
      return { size, lastModified };
    },
    readText: async (path) => (await file(path)).text(),
    readBytes: async (path, start) => new Uint8Array(await (await file(path)).slice(start).arrayBuffer()),
    exists: (path) =>
      file(path).then(
        () => true,
        () => false,
      ),
  };
}
