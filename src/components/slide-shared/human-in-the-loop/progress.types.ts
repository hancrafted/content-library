/** What the visual says about the viewer's saved progress, and what it lets them do with it. */

/** The note about saved progress: an entry of an edited Workflow waits for a choice, or storage refused a write. */
export interface ProgressNote {
  readonly kind: 'stale' | 'unsaved';
  /** Saves the old entry (stale) or the current run (unsaved) as a file. */
  readonly onDownload: () => void;
  /** Forgets the old entry; stale only. */
  readonly onDiscard: () => void;
}

/** What the toolbar does with the run of the shown Workflow; none for an uploaded one, whose run is not kept. */
export interface ProgressActions {
  /** Saves the current run as a YAML file. */
  readonly onDownload: () => void;
  /** The text of a progress file the viewer chose; the parent checks it against the shown Workflow. */
  readonly onUpload: (yaml: string) => void;
}
