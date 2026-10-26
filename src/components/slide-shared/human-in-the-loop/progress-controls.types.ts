/*
 * The slices of the parent that the saved run, its note and the teaching switch need: kept apart from the part-slot
 * contract of `human-in-the-loop.types.ts`, which holds the parts' own props.
 */

/** The note about saved progress: an entry of an edited Workflow waits for a choice, or storage refused a write. */
export interface ProgressNote {
  readonly kind: 'stale' | 'unsaved';
  /** Saves the old entry (stale) or the current run (unsaved) as a file. */
  readonly onDownload: () => void;
  /** Forgets the old entry; stale only. */
  readonly onDiscard: () => void;
}

/** What the teaching switch and Reset need to draw, the same in the toolbar and at the popover's top right. */
export interface TeachingState {
  /** The switch and Reset each show unless the Preset hides them (or the Preset is readonly). */
  readonly show: boolean;
  readonly resetShow: boolean;
  /** Teaching mode is on. */
  readonly on: boolean;
  /** A result is pasted: the switch is disabled until Reset. */
  readonly locked: boolean;
  /** Saved work was found for this Workflow, here or in another Episode: Reset turns the warning colour. */
  readonly hasWork: boolean;
}

/** The teaching switch and Reset, as props of the parts that hold them. */
export interface TeachingProps {
  readonly teaching: TeachingState;
  readonly onTeaching: (teaching: boolean) => void;
  /** Clears this Workflow's run and its saved entry; the parts confirm first. */
  readonly onReset: () => void;
  /** Saves the current run as a progress file: the download Reset offers first. None for an uploaded Workflow, whose run no file can vouch for. */
  readonly onDownloadRun?: () => void;
}

/** What the toolbar does with the run of the shown Workflow; none for an uploaded one, whose run is not kept. */
export interface ProgressActions {
  /** Saves the current run as a YAML file. */
  readonly onDownload: () => void;
  /** The text of a progress file the viewer chose; the parent checks it against the shown Workflow. */
  readonly onUpload: (yaml: string) => void;
}
