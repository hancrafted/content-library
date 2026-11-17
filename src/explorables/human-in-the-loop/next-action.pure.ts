export interface PanelProgress {
  readonly key: string;
  readonly copied: boolean;
  readonly done: boolean;
  readonly needsInput?: boolean;
  readonly optional?: boolean;
  readonly then?: { readonly key: string; readonly copied: boolean };
}

export type NextAction = { readonly key: string; readonly action: 'context' | 'copy' | 'answer' } | null;

export function nextAction(panels: readonly PanelProgress[]): NextAction {
  const at = panels.find((panel) => !panel.done && !panel.optional);
  if (!at) return null;
  if (at.needsInput) return { key: at.key, action: 'context' };
  if (!at.copied) return { key: at.key, action: 'copy' };
  if (at.then && !at.then.copied) return { key: at.then.key, action: 'copy' };
  return { key: at.key, action: 'answer' };
}
