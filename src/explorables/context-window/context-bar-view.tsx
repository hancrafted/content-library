import type { ReactNode } from 'react';
import type { BarBlock } from './context-bars.pure';
import styles from './context.module.css';
import { tint, vars } from './window-bits';

export type BarOrientation = 'vertical' | 'horizontal';

export interface BarLine {
  readonly id: string;
  readonly at: number;
  readonly crossed: boolean;
}

export function BarBuffer({ size, total }: { readonly size: number; readonly total: number }) {
  return <div className={styles.buffer} aria-hidden="true" style={vars({ '--z': (size / total) * 100 })} />;
}

export function BarLines({ lines }: { readonly lines: readonly BarLine[] }) {
  return lines.map((line) => (
    <div
      key={line.id}
      className={styles.line}
      aria-hidden="true"
      data-crossed={line.crossed ? '' : undefined}
      style={vars({ '--f': line.at })}
    />
  ));
}

export interface ContextBarViewProps {
  readonly orientation: BarOrientation;
  readonly total: number;
  readonly blocks: readonly BarBlock[];
  readonly buffer?: number;
  readonly lines?: readonly BarLine[];
  readonly label: string;
  readonly labels?: readonly ReactNode[];
  readonly free?: ReactNode;
  readonly parts?: readonly BarPart[];
}

export interface BarPart {
  readonly rows: number;
  readonly aside?: ReactNode;
}

function Block({
  block,
  total,
  words,
  listed,
}: {
  readonly block: BarBlock;
  readonly total: number;
  readonly words: ReactNode;
  readonly listed: boolean;
}) {
  return (
    <div
      className={styles.block}
      role={listed ? 'listitem' : undefined}
      data-block={block.key}
      data-faded={block.faded ? '' : undefined}
      data-ring={block.ring ? '' : undefined}
      style={tint(block.colour, { '--s': (block.start / total) * 100, '--z': (block.size / total) * 100 })}
    >
      {words}
    </div>
  );
}

type ListRow =
  | { readonly kind: 'block'; readonly block: BarBlock; readonly words: ReactNode }
  | { readonly kind: 'split'; readonly part: number }
  | { readonly kind: 'free' };

interface AsideSpan {
  readonly aside: ReactNode;
  readonly from: number;
  readonly to: number;
}

function listLayout(
  blocks: readonly BarBlock[],
  labels: readonly ReactNode[],
  parts: readonly BarPart[],
): { readonly rows: readonly ListRow[]; readonly spans: readonly AsideSpan[] } {
  const held = parts.reduce((sum, part) => sum + part.rows, 0);
  if (held !== blocks.length)
    throw new Error(`context bar: its parts hold ${held} rows, but it has ${blocks.length} blocks`);
  const rows: ListRow[] = [];
  const spans: AsideSpan[] = [];
  let next = 0;
  parts.forEach((part, i) => {
    if (i > 0) rows.push({ kind: 'split', part: i });
    const from = rows.length + 1;
    blocks
      .slice(next, next + part.rows)
      .forEach((block, j) => rows.push({ kind: 'block', block, words: labels[next + j] }));
    next += part.rows;
    if (part.aside !== undefined) spans.push({ aside: part.aside, from, to: rows.length + 1 });
  });
  rows.push({ kind: 'free' });
  return { rows, spans };
}

const track = (row: ListRow, total: number, free: number): string => {
  if (row.kind === 'split') return 'auto';
  const share = row.kind === 'block' ? row.block.size / total : free / total;
  return `minmax(min-content, ${Number(share.toFixed(4))}fr)`;
};

function ListRowView({
  row,
  total,
  free,
}: {
  readonly row: ListRow;
  readonly total: number;
  readonly free: ReactNode;
}) {
  if (row.kind === 'split') return <div className={styles.split} data-split="" aria-hidden="true" />;
  if (row.kind === 'free')
    return (
      <div className={styles.freeRow} role="listitem">
        {free}
      </div>
    );
  return <Block block={row.block} total={total} words={row.words} listed />;
}

function Asides({ spans }: { readonly spans: readonly AsideSpan[] }) {
  return spans.map(({ aside, from, to }) => (
    <div key={from} className={styles.aside} data-aside="" style={vars({ '--from': from, '--to': to })}>
      {aside}
    </div>
  ));
}

const rowKey = (row: ListRow): string =>
  row.kind === 'block' ? row.block.key : row.kind === 'split' ? `split-${row.part}` : 'free';

function ListedBar(props: Omit<ContextBarViewProps, 'labels'> & { readonly labels: readonly ReactNode[] }) {
  const { orientation, total, blocks, lines = [], label, labels, parts = [{ rows: blocks.length }] } = props;
  const { rows, spans } = listLayout(blocks, labels, parts);
  const free = total - blocks.reduce((sum, block) => sum + block.size, 0);
  return (
    <div
      className={styles.listed}
      data-listed=""
      data-asides={spans.length > 0 ? '' : undefined}
      style={{ gridTemplateRows: rows.map((row) => track(row, total, free)).join(' ') }}
    >
      <div
        className={`${styles.bar} ${styles.barView}`}
        data-orientation={orientation}
        data-labelled=""
        role="list"
        aria-label={label}
      >
        {rows.map((row) => (
          <ListRowView key={rowKey(row)} row={row} total={total} free={props.free} />
        ))}
        <BarLines lines={lines} />
      </div>
      <Asides spans={spans} />
    </div>
  );
}

export function ContextBarView(props: ContextBarViewProps) {
  const { orientation, total, blocks, buffer = 0, lines = [], label, labels } = props;
  if (labels !== undefined) return <ListedBar {...props} labels={labels} />;
  return (
    <div className={`${styles.bar} ${styles.barView}`} data-orientation={orientation} role="img" aria-label={label}>
      {blocks.map((block) => (
        <Block key={block.key} block={block} total={total} words={undefined} listed={false} />
      ))}
      {buffer > 0 && <BarBuffer size={buffer} total={total} />}
      <BarLines lines={lines} />
    </div>
  );
}
