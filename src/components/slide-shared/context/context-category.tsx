import { ChevronRight } from 'lucide-react';
import { memo, useMemo } from 'react';
import { oneDecimal, percentText } from './context-format.pure';
import type { ContextCategoryProps } from './context-parts.types';
import { matcher } from './context-state.pure';
import { usageRows, type UsageRow } from './context-usage.pure';
import { k, type Say } from './context-view';
import styles from './context.module.css';
import { colourOf, simpleOf } from './context.pure';
import type { Category } from './context.types';
import { HeadToggles } from './head-toggles';
import { Moves } from './moves.client';
import { useLighting } from './use-lighting';
import { useSay } from './use-say';
import { Glyph, tint } from './window-bits';

/* The context category: usage by category, one row per category. Its own part: it lights and pins through its own
 * callbacks, whether the parent places it beside the window (Simple) or beneath it (Technical). In Technical the
 * Messages group is a collapsible, closed at first, to save vertical room; in Simple there is none. */

function rowLabel(say: Say, row: UsageRow): string {
  if (row.kind === 'cat') return say.words.categories[row.cat];
  if (row.kind === 'simple') return say.words.simpleCategories[row.simple];
  if (row.kind === 'group') return say.words.messages;
  return row.kind === 'free' ? say.words.free : say.words.buffer[say.tech ? 'technical' : 'simple'];
}

function rowColour(row: UsageRow): string {
  if (row.kind === 'cat') return colourOf(row.cat, 'technical');
  return row.kind === 'simple' ? `--cs-s-${row.simple}` : '--cs-sub';
}

function rowOn(key: string | null, lit: string | null, litCats: ReadonlySet<Category>): boolean {
  if (!key) return false;
  if (key === lit) return true;
  if (key.startsWith('cat:')) return litCats.has(key.slice(4) as Category);
  return key.startsWith('scat:') && [...litCats].some((cat) => simpleOf(cat) === key.slice(5));
}

function RowGlyph({ row }: { readonly row: UsageRow }) {
  if (row.kind === 'group') return <span />;
  return <Glyph kind={row.kind === 'free' || row.kind === 'buffer' ? row.kind : 'used'} />;
}

function rowNumber(say: Say, row: UsageRow, windowTokens: number): string {
  const percent = (row.tokens / windowTokens) * 100;
  if (say.tech) return `${k(say, row.tokens)} (${oneDecimal(percent, say.locale)}%)`;
  return `${k(say, row.tokens)} · ${percentText(percent, say.locale)}%`;
}

const flag = (on: boolean) => (on ? '' : undefined);

interface RowProps {
  readonly say: Say;
  readonly row: UsageRow;
  readonly windowTokens: number;
  readonly on: boolean;
  readonly pressed: boolean;
}

/** A row with a key is a button that lights and pins its category; free space and the buffer are plain. */
const Row = memo(function Row({ say, row, windowTokens, on, pressed }: RowProps) {
  const Tag = row.key ? 'button' : 'span';
  const press = row.key ? { type: 'button' as const, 'data-part': row.key, 'aria-pressed': pressed } : {};
  return (
    <Moves
      as={Tag}
      trigger={`${on}|${pressed}|${row.tokens}`}
      {...press}
      data-sub={flag(row.kind === 'cat' && row.sub)}
      data-zero={flag(row.tokens === 0)}
      data-on={flag(on)}
      className={row.kind === 'group' ? `${styles.row} font-semibold` : styles.row}
      style={tint(rowColour(row))}
    >
      <RowGlyph row={row} />
      <span className={styles.rowName}>{rowLabel(say, row)}</span>
      <span className={say.tech ? `${styles.rowNum} font-mono` : styles.rowNum}>
        {rowNumber(say, row, windowTokens)}
      </span>
    </Moves>
  );
});

interface RowsProps {
  readonly say: Say;
  readonly rows: readonly UsageRow[];
  readonly windowTokens: number;
  readonly lit: string | null;
  readonly pinned: string | null;
  readonly litCats: ReadonlySet<Category>;
}

function Rows({ say, rows, windowTokens, lit, pinned, litCats }: RowsProps) {
  return rows.map((row, i) => (
    <Row
      key={row.key ?? `${row.kind}-${i}`}
      say={say}
      row={row}
      windowTokens={windowTokens}
      on={rowOn(row.key, lit, litCats)}
      pressed={pinned === row.key}
    />
  ));
}

/** The Messages group and its rows as a collapsible, closed until opened: the summary is the group's own row. */
function Messages(props: RowsProps & { readonly group: UsageRow }) {
  const { group, ...rows } = props;
  return (
    <details className={styles.messages} data-on={flag(rowOn(group.key, props.lit, props.litCats))}>
      <Moves
        as="summary"
        className={`${styles.row} font-semibold`}
        data-part={group.key}
        data-on={flag(rowOn(group.key, props.lit, props.litCats))}
      >
        <ChevronRight aria-hidden="true" className={styles.chevron} />
        <span className={styles.rowName}>{rowLabel(props.say, group)}</span>
        <span className={`${styles.rowNum} font-mono`}>{rowNumber(props.say, group, props.windowTokens)}</span>
      </Moves>
      <Rows {...rows} />
    </details>
  );
}

/** Technical: top rows, the Messages collapsible, the free space and buffer. Simple: every row, no collapsible. */
function Body(props: RowsProps) {
  const group = props.rows.find((row) => row.kind === 'group');
  if (!props.say.tech || !group) return <Rows {...props} />;
  const sub = (row: UsageRow) => row.kind === 'cat' && row.sub;
  const at = props.rows.indexOf(group);
  const inside = props.rows.filter(sub);
  const after = props.rows.slice(at + 1).filter((row) => !sub(row));
  return (
    <>
      <Rows {...props} rows={props.rows.slice(0, at)} />
      <Messages {...props} group={group} rows={inside} />
      <Rows {...props} rows={after} />
    </>
  );
}

export function ContextCategory(props: ContextCategoryProps) {
  const { frame, window, present, lit, pinned } = props;
  const say = useSay(props);
  const handlers = useLighting(props);
  const depth = say.tech ? 'technical' : 'simple';
  const rows = useMemo(() => usageRows(frame, depth, { window, present }), [frame, depth, window, present]);
  const match = useMemo(() => matcher(lit), [lit]);
  const litCats = useMemo(
    () => new Set(frame.blocks.filter((b) => match(b.id, b.cat)).map((b) => b.cat)),
    [frame, match],
  );
  return (
    <div className={styles.usage} role="group" aria-label={say.words.usage} data-depth={depth} {...handlers}>
      <div className={styles.head}>
        <b className="font-semibold">{say.words.parts.category}</b>
        <div className={styles.headEnd}>
          <HeadToggles toggles={props.toggles} say={say} />
        </div>
      </div>
      <Body say={say} rows={rows} windowTokens={window.tokens} lit={lit} pinned={pinned} litCats={litCats} />
    </div>
  );
}
