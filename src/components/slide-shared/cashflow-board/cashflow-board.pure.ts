/** What a sticky note on the cashflow board stands for; a `ghost` is the dashed outline where a note used to be. */
export type NoteKind = 'cash' | 'cost' | 'revenue' | 'ghost';

/** One sticky note. `amount` is in euros and never signed: the board prints a cost's minus itself. */
export interface Note {
  readonly kind: NoteKind;
  readonly amount?: number;
  /** A larger note, for the one number the board turns on. */
  readonly big?: boolean;
  /** A `primary` ring around the note, for the one note a Slide points at. */
  readonly ring?: boolean;
  /** The Context drawer target the note carries, the value a Slide kit's `target(…)` names. */
  readonly target?: string;
}

/** A column's three slots, top to bottom; `null` is an empty slot. */
export interface NoteSlots {
  readonly notes: readonly (Note | null)[];
}

/** Where a lane sits: two lanes per row when the board is narrow, all in one row when it is wide. */
export interface LanePlacement {
  readonly narrowColumn: number;
  readonly narrowRow: number;
  readonly wideColumn: number;
}

/** Grid rows one lane spans: its three slots and its footer. */
export const LANE_ROWS = 4;
/** Lanes per row while the board is narrow. */
export const NARROW_LANES = 2;

/** Degrees a note rests at, by column (cycled) then slot, so a note tilts the same on every board. */
const TILTS: readonly (readonly number[])[] = [
  [-2, 1, -1],
  [2, -1, 1],
  [-2, 1, -1],
  [1, 2, -2],
];

/** A note's amount as it moves the balance: a cost takes money out, a ghost or a note with no amount moves nothing. */
export function signedAmount(note: Note): number {
  const amount = note.amount ?? 0;
  return note.kind === 'cost' ? -amount : amount;
}

/**
 * The cash left at each column's end, read top to bottom: a cash note states the balance, a cost takes from it,
 * revenue adds to it, and a column with no cash note starts from the column before it.
 */
export function cashLeft(columns: readonly NoteSlots[]): number[] {
  let balance = 0;
  return columns.map(({ notes }) => {
    for (const note of notes) {
      if (note === null || note.amount === undefined) continue;
      balance = note.kind === 'cash' ? note.amount : balance + signedAmount(note);
    }
    return balance;
  });
}

/** Euros as the locale writes money, whole euros, with a true minus sign (U+2212) on a negative amount. */
export function formatEuro(amount: number, locale: string): string {
  const written = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount === 0 ? 0 : amount);
  return written.replace('-', '\u2212');
}

/** The tilt in degrees of the note in a column and slot, both counted from 1. */
export function tiltOf(column: number, slot: number): number {
  return TILTS[(column - 1) % TILTS.length][(slot - 1) % 3];
}

/** Where the lane of a column, counted from 1, sits on the board's grid in its narrow and wide layouts. */
export function lanePlacement(column: number): LanePlacement {
  const index = column - 1;
  return {
    narrowColumn: (index % NARROW_LANES) + 1,
    narrowRow: Math.floor(index / NARROW_LANES) * LANE_ROWS + 1,
    wideColumn: column,
  };
}

/** A column and a slot, both counted from 1. */
export type BoardCell = readonly [column: number, slot: number];

/** What `checkBoard` reads: where each overlay is placed, and how many columns there are. */
export interface BoardPlacements {
  readonly count: number;
  readonly stamp?: { readonly column: number };
  readonly arrow?: { readonly from: BoardCell; readonly to: BoardCell };
  readonly highlight?: number;
  readonly annotations?: readonly { readonly column: number; readonly span?: number }[];
}

function checkColumn(column: number, count: number, what: string) {
  if (Number.isInteger(column) && column >= 1 && column <= count) return;
  throw new Error(`CashflowBoard: ${what} names column ${column}, but the board has columns 1 to ${count}.`);
}

function checkCell([column, slot]: BoardCell, count: number, what: string) {
  checkColumn(column, count, what);
  if (Number.isInteger(slot) && slot >= 1 && slot <= 3) return;
  throw new Error(`CashflowBoard: ${what} names slot ${slot}, but a lane has slots 1 to 3.`);
}

/** Throws when an overlay names a column or slot the board does not have, so a bad board fails the build. */
export function checkBoard({ count, stamp, arrow, highlight, annotations = [] }: BoardPlacements): void {
  if (stamp) checkColumn(stamp.column, count, 'the stamp');
  if (highlight !== undefined) checkColumn(highlight, count, 'the highlight');
  if (arrow) {
    checkCell(arrow.from, count, "the arrow's start");
    checkCell(arrow.to, count, "the arrow's end");
  }
  for (const { column, span = 1 } of annotations) {
    checkColumn(column, count, 'an annotation');
    checkColumn(column + span - 1, count, "an annotation's span");
  }
}
