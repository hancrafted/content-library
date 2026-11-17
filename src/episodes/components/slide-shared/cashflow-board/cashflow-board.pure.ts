export type NoteKind = 'cash' | 'cost' | 'revenue' | 'ghost';

/** One sticky note. `amount` is in euros and never signed: the board prints a cost's minus itself. */
export interface Note {
  readonly kind: NoteKind;
  readonly amount?: number;
  readonly big?: boolean;
  readonly ring?: boolean;
  readonly target?: string;
}

/** A column's three slots, top to bottom; `null` is an empty slot. */
export interface NoteSlots {
  readonly notes: readonly (Note | null)[];
}

export interface LanePlacement {
  readonly narrowColumn: number;
  readonly narrowBand: number;
  readonly wideColumn: number;
}

const SLOTS = 3;
export const NARROW_LANES = 2;

const TILTS: readonly (readonly number[])[] = [
  [-2, 1, -1],
  [2, -1, 1],
  [-2, 1, -1],
  [1, 2, -2],
];

export function signedAmount(note: Note): number {
  const amount = note.amount ?? 0;
  return note.kind === 'cost' ? -amount : amount;
}

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

export function lanePlacement(column: number): LanePlacement {
  const index = column - 1;
  return {
    narrowColumn: (index % NARROW_LANES) + 1,
    narrowBand: Math.floor(index / NARROW_LANES),
    wideColumn: column,
  };
}

export interface ArrowCells {
  readonly from: BoardCell;
  readonly to: BoardCell;
  readonly label?: string;
  readonly variant?: 'shaft' | 'curve';
  readonly labelGap?: number;
}

export interface SlotReach {
  readonly columns: readonly NoteSlots[];
  readonly stamp?: { readonly column: number };
  readonly arrow?: ArrowCells;
}

function arrowReach({ from, to, label, variant, labelGap }: NonNullable<SlotReach['arrow']>): number {
  const labelUnder = label !== undefined && (variant === 'curve' || labelGap !== undefined);
  return Math.max(from[1], to[1], labelUnder ? from[1] + 1 : 0);
}

export function slotRows({ columns, stamp, arrow }: SlotReach): number {
  const notes = columns.map(({ notes: slots }) => slots.reduce((low, note, index) => (note ? index + 1 : low), 0));
  return Math.min(SLOTS, Math.max(1, ...notes, stamp ? 2 : 0, arrow ? arrowReach(arrow) : 0));
}

export type BoardCell = readonly [column: number, slot: number];

export interface BoardPlacements {
  readonly count: number;
  readonly stamp?: { readonly column: number };
  readonly arrow?: Pick<ArrowCells, 'from' | 'to' | 'labelGap'>;
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

function checkArrow({ from, to, labelGap }: NonNullable<BoardPlacements['arrow']>, count: number) {
  checkCell(from, count, "the arrow's start");
  checkCell(to, count, "the arrow's end");
  if (labelGap === undefined) return;
  checkColumn(labelGap, count, "the arrow's label gap");
  checkColumn(labelGap + 1, count, "the column after the arrow's label gap");
}

/** Throws when an overlay names a column or slot the board does not have, so a bad board fails the build. */
export function checkBoard({ count, stamp, arrow, highlight, annotations = [] }: BoardPlacements): void {
  if (stamp) checkColumn(stamp.column, count, 'the stamp');
  if (highlight !== undefined) checkColumn(highlight, count, 'the highlight');
  if (arrow) checkArrow(arrow, count);
  for (const { column, span = 1 } of annotations) {
    checkColumn(column, count, 'an annotation');
    checkColumn(column + span - 1, count, "an annotation's span");
  }
}
