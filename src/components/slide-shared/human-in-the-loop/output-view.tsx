import type { ReactNode } from 'react';
import type { Handoff } from './handoff.pure';

/**
 * The seam for an example result: the modal calls `renderOutput(handoff)` for each parsed output block. This is the
 * plain-text fallback; the renderers ticket (#269) replaces the body with the view of each kind.
 */
export function renderOutput(handoff: Handoff): ReactNode {
  return <pre className="whitespace-pre-wrap text-caption">{plainText(handoff)}</pre>;
}

function plainText(handoff: Handoff): string {
  return handoff.kind === 'text' ? handoff.text : JSON.stringify(handoff, null, 2);
}
