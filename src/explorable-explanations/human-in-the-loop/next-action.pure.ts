/*
 * The one control of a stepper item that leads the viewer on, derived from the run, never authored per Workflow: the
 * first required step not yet done leads, with its context while a field has neither a value nor a sample, else its
 * Copy prompt until that is pressed, then its answer (the result box, or the box to tick). An optional step (the check)
 * never leads, so a pasted result ends the item. The chat buttons and Copy explanation prompt never lead.
 */

/** Where one step of an item stands. */
export interface PanelProgress {
  readonly key: string;
  /** Its Copy prompt was pressed while the modal was open. */
  readonly copied: boolean;
  /** Its result is pasted, or its box ticked. */
  readonly done: boolean;
  /** A context field has neither a value nor a sample, so the prompt cannot run yet. */
  readonly needsInput?: boolean;
  /** The step may be skipped (the check): it never leads. */
  readonly optional?: boolean;
}

export type NextAction = { readonly key: string; readonly action: 'context' | 'copy' | 'answer' } | null;

export function nextAction(panels: readonly PanelProgress[]): NextAction {
  const at = panels.find((panel) => !panel.done && !panel.optional);
  if (!at) return null;
  if (at.needsInput) return { key: at.key, action: 'context' };
  return { key: at.key, action: at.copied ? 'answer' : 'copy' };
}
