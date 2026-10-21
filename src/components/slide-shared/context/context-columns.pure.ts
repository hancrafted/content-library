import { renderModeOf, type ViewState } from './context-state.pure';
import type { Part } from './context.types';

/* The main CSS grid: one column per part shown, in the order the reader gave, one row. The context category always
 * sits beside the window, Simple or Technical. */

/** The conversation keeps its column while no flexible part (the details, the attention) takes the rest of the row. */
function chatWidth(parts: ViewState['parts']): string {
  return !parts.panel && !parts.attention ? 'minmax(16rem, 40rem)' : 'minmax(16rem, 1.15fr)';
}

function grid(shown: readonly (readonly [string, string])[]) {
  return {
    '--cols': shown.map(([col]) => col).join(' ') || '1fr',
    '--areas': shown.length ? `'${shown.map(([, area]) => area).join(' ')}'` : 'none',
    '--rows': 'none',
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
  const shown = state.order.flatMap((part) => {
    const column = all[part];
    return column && parts[part] ? [column] : [];
  });
  return { ...grid(shown), '--main-h': `${height}rem` };
}
