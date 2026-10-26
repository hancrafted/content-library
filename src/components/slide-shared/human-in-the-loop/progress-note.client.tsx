'use client';

import { Button } from '@/components/ui/button';
import type { ProgressNote as Note, UiWords } from './human-in-the-loop.types';

/*
 * The note over the toolbar about saved progress. Stale: the saved run belongs to an older Workflow; the viewer keeps it
 * as a file or discards it. Unsaved: the browser refused the write, so the viewer is asked to download their progress.
 */

export function ProgressNote({ note, words }: { readonly note: Note; readonly words: UiWords }) {
  const stale = note.kind === 'stale';
  return (
    <div
      role="status"
      data-progress-note={note.kind}
      className="mb-3 flex flex-wrap items-center gap-2 rounded-md border bg-muted px-3 py-2 text-body"
    >
      <p className="min-w-0 flex-1">{stale ? words.noteStale : words.noteUnsaved}</p>
      <Button type="button" variant="outline" size="sm" onClick={note.onDownload}>
        {stale ? words.downloadOldProgress : words.downloadProgress}
      </Button>
      {stale && (
        <Button type="button" variant="ghost" size="sm" onClick={note.onDiscard}>
          {words.discardProgress}
        </Button>
      )}
    </div>
  );
}
