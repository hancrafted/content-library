import { renderModeOf, type ViewState } from './context-state.pure';
import type { Part } from './context.types';

/* The main CSS grid: one column per part shown, in the order the reader gave, one row. The context category always
 * sits beside the window, Simple or Technical. Five parts or more do not fit one row of a Slide, so the grid also
 * carries a two-row layout, which the stylesheet takes on a container too narrow for one row: the flexible parts (the
 * details, the attention) move under the others, splitting the width between them. */

/** The parts that take the rest of the row, and so move to the second row when the grid wraps. */
const FLEXIBLE: readonly Part[] = ['panel', 'attention'];
/** Fewer parts always fit one row. */
const WRAP_FROM = 5;

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

type Column = readonly [width: string, area: string];

/** The second row's areas: one flexible part spans every column; two split them, the first taking the left half. */
function secondRow(top: number, below: readonly Column[]): string[] {
  const half = Math.floor(top / 2);
  return Array.from({ length: top }, (_, i) => (below.length === 1 || i < half ? below[0]! : below[1]!)[1]);
}

/** The two-row layout of a grid too wide for one row, or nothing while one row holds it. */
interface Wrap {
  readonly '--cols-wrap'?: string;
  readonly '--areas-wrap'?: string;
  readonly '--rows-wrap'?: string;
}

function wrapped(shown: readonly (readonly [Part, Column])[], height: number): Wrap {
  const below = shown.filter(([part]) => FLEXIBLE.includes(part)).map(([, column]) => column);
  const above = shown.filter(([part]) => !FLEXIBLE.includes(part)).map(([, column]) => column);
  if (shown.length < WRAP_FROM || below.length === 0 || above.length < 2) return {};
  return {
    '--cols-wrap': above.map(([col]) => col).join(' '),
    '--areas-wrap': `'${above.map(([, area]) => area).join(' ')}' '${secondRow(above.length, below).join(' ')}'`,
    // The second row as tall as the first, so the attention list keeps the height an Episode gives it.
    '--rows-wrap': `${height}rem ${height}rem`,
  };
}

/** The grid's columns, one per part shown, in the order the reader gave: the layout follows the parts. */
export function columns(parts: ViewState['parts'], state: ViewState, height: number): Record<string, string> & Wrap {
  const all: Partial<Record<Part, Column>> = {
    chat: [chatWidth(parts), 'chat'],
    timeline: ['3.5rem', 'timeline'],
    context: [renderModeOf(state, 'context-window') === 'technical' ? '15rem' : '16rem', 'ctx'],
    category: ['minmax(11rem, 16rem)', 'cat'],
    panel: [parts.chat ? 'minmax(15rem, 1fr)' : 'minmax(15rem, 1.6fr)', 'panel'],
    attention: [parts.chat ? 'minmax(15rem, 1fr)' : 'minmax(15rem, 1.6fr)', 'att'],
  };
  const shown = state.order.flatMap((part) => {
    const column = all[part];
    return column && parts[part] ? [[part, column] as const] : [];
  });
  return { ...grid(shown.map(([, column]) => column)), ...wrapped(shown, height), '--main-h': `${height}rem` };
}
