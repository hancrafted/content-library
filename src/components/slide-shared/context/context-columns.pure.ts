import { renderModeOf, type ViewState } from './context-state.pure';
import type { Part } from './context.types';

/* The main row's CSS grid: one column per part shown, in the order the reader gave. */

function chatWidth(parts: ViewState['parts']): string {
  return !parts.context && !parts.panel ? 'minmax(16rem, 40rem)' : 'minmax(16rem, 1.15fr)';
}

/** The grid's columns, one per part shown, in the order the reader gave: the layout follows the parts. */
export function columns(parts: ViewState['parts'], state: ViewState, height: number) {
  const all: Partial<Record<Part, readonly [string, string]>> = {
    chat: [chatWidth(parts), 'chat'],
    timeline: ['3.5rem', 'timeline'],
    context: [renderModeOf(state, 'context-window') === 'technical' ? '15rem' : '16rem', 'ctx'],
    preview: ['minmax(11rem, 16rem)', 'prev'],
    panel: [parts.chat ? 'minmax(15rem, 1fr)' : 'minmax(15rem, 1.6fr)', 'panel'],
    attention: [parts.chat ? 'minmax(15rem, 1fr)' : 'minmax(15rem, 1.6fr)', 'att'],
  };
  const shown = state.order.flatMap((part) => {
    const column = all[part];
    return column && parts[part] ? [column] : [];
  });
  const areas = shown.map(([, area]) => area).join(' ');
  return {
    '--cols': shown.map(([col]) => col).join(' ') || '1fr',
    '--areas': areas ? `'${areas}'` : 'none',
    '--main-h': `${height}rem`,
  };
}
