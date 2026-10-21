import { useEffect, useRef, type KeyboardEvent } from 'react';
import { fullTokens, oneDecimal, percentText } from './context-format.pure';
import { gridBoxes, usageRows, type GridBox, type UsageRow } from './context-usage.pure';
import { catLabel, fill, k, type View } from './context-view';
import styles from './context.module.css';
import { colourOf, simpleOf } from './context.pure';
import type { Category } from './context.types';
import { Glyph, tint } from './window-bits';

/* Usage by category, and Claude Code's /context grid of 100 boxes. */

function rowLabel(v: View, row: UsageRow): string {
  if (row.kind === 'cat') return v.words.categories[row.cat];
  if (row.kind === 'simple') return v.words.simpleCategories[row.simple];
  if (row.kind === 'group') return v.words.messages;
  return row.kind === 'free' ? v.words.free : v.words.buffer[v.state.depth];
}

function rowColour(row: UsageRow): string {
  if (row.kind === 'cat') return colourOf(row.cat, 'technical');
  return row.kind === 'simple' ? `--cs-s-${row.simple}` : '--cs-sub';
}

/** The categories of every lit block in the window: a row lights with any of them. */
function litCategories(v: View): ReadonlySet<Category> {
  return new Set(v.frame.blocks.filter((b) => v.match(b.id, b.cat)).map((b) => b.cat));
}

function rowOn(v: View, key: string | null, lit: ReadonlySet<Category>): boolean {
  if (!key) return false;
  if (key === v.lit) return true;
  if (key.startsWith('cat:')) return lit.has(key.slice(4) as Category);
  return key.startsWith('scat:') && [...lit].some((cat) => simpleOf(cat) === key.slice(5));
}

function RowGlyph({ row }: { readonly row: UsageRow }) {
  if (row.kind === 'group') return <span />;
  return <Glyph kind={row.kind === 'free' || row.kind === 'buffer' ? row.kind : 'used'} />;
}

function rowNumber(v: View, row: UsageRow): string {
  const percent = (row.tokens / v.window.tokens) * 100;
  if (v.tech) return `${k(v, row.tokens)} (${oneDecimal(percent, v.locale)}%)`;
  return `${k(v, row.tokens)} · ${percentText(percent, v.locale)}%`;
}

const flag = (on: boolean) => (on ? '' : undefined);

/** A row with a key is a button that lights and pins its category; free space and the buffer are plain. */
function rowAttrs(v: View, row: UsageRow, lit: ReadonlySet<Category>) {
  const press = row.key
    ? { type: 'button' as const, 'data-part': row.key, 'aria-pressed': v.state.pinned === row.key }
    : {};
  return {
    ...press,
    'data-sub': flag(row.kind === 'cat' && row.sub),
    'data-zero': flag(row.tokens === 0),
    'data-on': flag(rowOn(v, row.key, lit)),
  };
}

function Row({ v, row, lit }: { readonly v: View; readonly row: UsageRow; readonly lit: ReadonlySet<Category> }) {
  const Tag = row.key ? 'button' : 'span';
  return (
    <Tag
      {...rowAttrs(v, row, lit)}
      className={row.kind === 'group' ? `${styles.row} font-semibold` : styles.row}
      style={tint(rowColour(row))}
    >
      <RowGlyph row={row} />
      <span className={styles.rowName}>{rowLabel(v, row)}</span>
      <span className={v.tech ? `${styles.rowNum} font-mono` : styles.rowNum}>{rowNumber(v, row)}</span>
    </Tag>
  );
}

export function Usage({ v }: { readonly v: View }) {
  const rows = usageRows(v.frame, v.state.depth, { window: v.window, present: v.present });
  const lit = litCategories(v);
  return (
    <div className={styles.usage} role="group" aria-label={v.words.usage}>
      <div className={styles.usageTitle}>{v.words.usageTitle[v.state.depth]}</div>
      {rows.map((row, i) => (
        <Row key={row.key ?? `${row.kind}-${i}`} v={v} row={row} lit={lit} />
      ))}
    </div>
  );
}

type Kind = 'used' | 'free' | 'buffer';
interface Morph {
  readonly morph: 'fill' | 'empty';
  readonly delay: number;
}
const MORPH: Readonly<Record<string, Morph['morph']>> = { 'free>used': 'fill', 'used>free': 'empty' };

/** Morphs only the boxes that changed between free and used since the last render; entering fills from empty. */
function useMorphs(kinds: readonly Kind[]): readonly (Morph | null)[] {
  const last = useRef<readonly Kind[] | null>(null);
  const before = last.current ?? kinds.map((kind) => (kind === 'buffer' ? 'buffer' : 'free'));
  useEffect(() => {
    last.current = kinds;
  });
  let order = 0;
  return kinds.map((kind, i) => {
    const morph = MORPH[`${before[i]}>${kind}`];
    return morph ? { morph, delay: Math.min(order++, 40) * 8 } : null;
  });
}

/** How a box takes part: the first box of a block is its button, the rest repeat it, free and buffer boxes are inert. */
type Role = 'button' | 'repeat' | 'inert';

interface BoxProps {
  readonly v: View;
  readonly box: GridBox;
  readonly role: Role;
  readonly tab: boolean;
  readonly morph: Morph | null;
}

function usedAttrs({ v, box, role, tab, morph }: BoxProps & { readonly box: Extract<GridBox, { kind: 'used' }> }) {
  const part = `${box.id}@${box.cat}`;
  const style = tint(colourOf(box.cat, v.state.depth), { '--md': `${morph?.delay ?? 0}ms` });
  const lit = { 'data-part': part, 'data-on': flag(v.match(box.id, box.cat)), style };
  if (role !== 'button') return lit;
  const label = fill(v.words.boxLabel, { step: v.stepOf.get(box.id) ?? 0, category: catLabel(v, box.cat) });
  return {
    ...lit,
    type: 'button' as const,
    tabIndex: tab ? 0 : -1,
    'aria-pressed': v.state.pinned === part,
    'aria-label': label,
  };
}

function boxAttrs(props: BoxProps) {
  const { box, morph } = props;
  const base = { className: styles.box, 'data-morph': morph?.morph };
  if (box.kind === 'used') return { ...base, ...usedAttrs({ ...props, box }) };
  return { ...base, 'data-free': flag(box.kind === 'free'), 'data-buffer': flag(box.kind === 'buffer') };
}

function Box(props: BoxProps) {
  const glyph = <Glyph kind={props.box.kind} />;
  if (props.role === 'button') return <button {...boxAttrs(props)}>{glyph}</button>;
  return (
    <span {...boxAttrs(props)} aria-hidden="true">
      {glyph}
    </span>
  );
}

/** Each box's role: the first box of every block is the one that takes focus and a click. */
function rolesOf(boxes: readonly GridBox[]): readonly Role[] {
  const seen = new Set<string>();
  return boxes.map((box) => {
    if (box.kind !== 'used') return 'inert';
    const part = `${box.id}@${box.cat}`;
    if (seen.has(part)) return 'repeat';
    seen.add(part);
    return 'button';
  });
}

interface GridProps {
  readonly v: View;
  readonly onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

/** Claude Code's /context grid: 100 boxes, one tab stop, arrows move between messages. */
export function Grid({ v, onKeyDown }: GridProps) {
  const boxes = gridBoxes(v.frame, v.window);
  const morphs = useMorphs(boxes.map((box) => box.kind));
  const roles = rolesOf(boxes);
  const label = fill(v.words.grid, { tokens: fullTokens(v.window.tokens / 100, v.locale) });
  return (
    <div className={styles.grid} role="group" aria-label={label} data-roving="" onKeyDown={onKeyDown}>
      {boxes.map((box, i) => (
        <Box key={i} v={v} box={box} role={roles[i] ?? 'inert'} tab={i === 0} morph={morphs[i] ?? null} />
      ))}
    </div>
  );
}
