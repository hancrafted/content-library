'use client';

import { Button } from '@/shared/components/ui/button';
import type { UiWords } from './human-in-the-loop.types';
import type { ProgressNote as Note } from './progress-controls.types';

const KINDS = {
  stale: { text: 'noteStale', download: 'downloadOldProgress', discard: true },
  unsaved: { text: 'noteUnsaved', download: 'downloadProgress', discard: false },
} as const satisfies Record<Note['kind'], { text: keyof UiWords; download: keyof UiWords; discard: boolean }>;

export function ProgressNote({ note, words }: { readonly note: Note; readonly words: UiWords }) {
  const kind = KINDS[note.kind];
  return (
    <div
      role="status"
      data-progress-note={note.kind}
      className="mb-3 flex flex-wrap items-center gap-2 rounded-md border bg-muted px-3 py-2 text-body"
    >
      <p className="min-w-0 flex-1">{words[kind.text]}</p>
      <Button type="button" variant="outline" size="sm" onClick={note.onDownload}>
        {words[kind.download]}
      </Button>
      {kind.discard && (
        <Button type="button" variant="ghost" size="sm" onClick={note.onDiscard}>
          {words.discardProgress}
        </Button>
      )}
    </div>
  );
}
