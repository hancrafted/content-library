import { renderModeOf, type ViewState } from './context-state.pure';
import type { Part } from './context.types';

/* The main CSS grid: one column per part shown, in the order the reader gave. The context category sits beside the
 * window in Simple and beneath it, in the window's column, in Technical. */

function chatWidth(parts: ViewState['parts']): string {
  return !parts.context && !parts.panel ? 'minmax(16rem, 40rem)' : 'minmax(16rem, 1.15fr)';
}

/** The category goes beneath the window, in its column, when the category is Technical and both are shown. */
const isBeneath = (parts: ViewState['parts'], state: ViewState): boolean =>
  parts.category && parts.context && renderModeOf(state, 'category') === 'technical';

/** The columns and the areas, one row, or two with the category under the window's `ctx` area. */
function grid(shown: readonly (readonly [string, string])[], beneath: boolean) {
  const row = (below: boolean) => shown.map(([, area]) => (below && area === 'ctx' ? 'cat' : area));
  const rows = beneath ? [row(false), row(true)] : [row(false)];
  return {
    '--cols': shown.map(([col]) => col).join(' ') || '1fr',
    '--areas': shown.length ? rows.map((cells) => `'${cells.join(' ')}'`).join(' ') : 'none',
    '--rows': beneath ? 'minmax(0, 1fr) auto' : 'none',
  };
}

/** The grid's columns, one per part shown, in the order the reader gave: the layout follows the parts. */
export function columns(parts: ViewState['parts'], state: ViewState, height: number) {
  const all: Partial<Record<Part, readonly [string, string]>> = {
    chat: [chatWidth(parts), 'chat'],
    timeline: ['3.5rem', 'timeline'],
    context: [renderModeOf(state, 'context-window') === 'technical' ? '15rem' : '16rem', 'ctx'],
    category: ['minmax(11rem, 16rem)', 'cat'],
    panel: [parts.chat ? 'minmax(15rem, 1fr)' : 'minmax(15rem, 1.6fr)', 'panel'],
    attention: [parts.chat ? 'minmax(15rem, 1fr)' : 'minmax(15rem, 1.6fr)', 'att'],
  };
  const beneath = isBeneath(parts, state);
  const shown = state.order.flatMap((part) => {
    const column = all[part];
    return column && parts[part] && !(beneath && part === 'category') ? [column] : [];
  });
  return { ...grid(shown, beneath), '--main-h': `${height}rem` };
}
