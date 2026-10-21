import { memo, useMemo, useRef } from 'react';
import { fullTokens, percentText } from './context-format.pure';
import type { ContextWindowProps } from './context-parts.types';
import { matcher } from './context-state.pure';
import { catLabel, fill, k, type Say } from './context-view';
import { Grid } from './context-window-grid';
import { Lens, Loupe, useLoupe } from './context-window-loupe';
import { rove } from './context-window-rove';
import styles from './context.module.css';
import { colourOf, type Frame, type PlacedBlock } from './context.pure';
import { loupeRows } from './loupe.pure';
import { useSay } from './use-say';
import { tint, vars } from './window-bits';

/* The context window part: the meter, the window switch, a fixed-height bar (Simple) or the /context grid (Technical). */

/** Every block of the chat at the place it first lands, so a block not in the window yet waits where it will land. */
function firstPlaces(frames: readonly Frame[]): ReadonlyMap<string, PlacedBlock> {
  const places = new Map<string, PlacedBlock>();
  for (const frame of frames)
    for (const block of frame.blocks) if (!places.has(block.key)) places.set(block.key, block);
  return places;
}

interface Part {
  readonly p: ContextWindowProps;
  readonly say: Say;
}

function Meter({ p, say }: Part) {
  const percent = percentText((p.frame.used / p.window.tokens) * 100, say.locale);
  const [before, after] = fill(say.words.meterValue, {
    used: k(say, p.frame.used),
    window: k(say, p.window.tokens),
  }).split('{percent}');
  return (
    <span className={styles.meterValue}>
      {before}
      <b className="text-body font-semibold">{percent}</b>
      {after}
    </span>
  );
}

function WindowSwitch({ p, say }: Part) {
  if (!p.switchable) return null;
  return (
    <div className={styles.windows} role="group" aria-label={say.words.windowGroup}>
      {p.sizes.map((size, i) => (
        <button key={size.tokens} type="button" aria-pressed={p.sizeIndex === i} onClick={() => p.onSize(i)}>
          {k(say, size.tokens).toUpperCase()}
        </button>
      ))}
    </div>
  );
}

const pct = (tokens: number, windowTokens: number) => (tokens / windowTokens) * 100;

interface BlockProps {
  readonly say: Say;
  readonly block: PlacedBlock;
  readonly at: PlacedBlock;
  readonly stepNo: number;
  readonly windowTokens: number;
  readonly first: boolean;
  readonly inWindow: boolean;
  readonly hot: boolean;
  readonly on: boolean;
  readonly pressed: boolean;
}

const BlockButton = memo(function BlockButton(props: BlockProps) {
  const { say, block, at, stepNo, windowTokens, first, inWindow, hot, on, pressed } = props;
  const label = fill(say.words.blockLabel, {
    category: catLabel(say, block.cat),
    step: stepNo,
    tokens: fullTokens(at.tokens, say.locale),
  });
  return (
    <button
      type="button"
      className={styles.block}
      data-part={block.key}
      data-hot={hot ? '' : undefined}
      data-out={inWindow ? undefined : ''}
      data-on={inWindow && on ? '' : undefined}
      tabIndex={first ? 0 : -1}
      aria-pressed={pressed}
      aria-label={label}
      style={tint(colourOf(block.cat, say.tech ? 'technical' : 'simple'), {
        '--s': pct(at.start, windowTokens),
        '--z': pct(at.tokens, windowTokens),
      })}
    />
  );
});

interface BlocksProps extends Part {
  readonly places: ReadonlyMap<string, PlacedBlock>;
  /** The block under the pointer while the loupe is open: it grows a little, by transform only. */
  readonly hot: string;
}

function Blocks({ p, say, places, hot }: BlocksProps) {
  const match = useMemo(() => matcher(p.lit), [p.lit]);
  const now = new Map(p.frame.blocks.map((b) => [b.key, b]));
  const first = p.frame.blocks[0]?.key;
  return [...places.values()].map((block) => (
    <BlockButton
      key={block.key}
      say={say}
      block={block}
      at={now.get(block.key) ?? block}
      stepNo={p.stepOf.get(block.id) ?? 0}
      windowTokens={p.window.tokens}
      first={block.key === first}
      inWindow={now.has(block.key)}
      hot={block.key === hot}
      on={match(block.id, block.cat)}
      pressed={p.pinned === block.key}
    />
  ));
}

/** One outline round a lit step's blocks, or a dashed empty one where a pinned step will land. */
function outlined(p: ContextWindowProps, places: ReadonlyMap<string, PlacedBlock>): readonly PlacedBlock[] {
  if (p.ghost) return [...places.values()].filter((b) => b.id === p.ghost);
  if (!p.lit || p.lit.includes(':')) return [];
  const [id, cat] = p.lit.split('@');
  return p.frame.blocks.filter((b) => b.id === id && (!cat || b.cat === cat));
}

function Outline({ p, places }: { readonly p: ContextWindowProps; readonly places: ReadonlyMap<string, PlacedBlock> }) {
  const own = outlined(p, places);
  const start = own[0]?.start;
  if (start === undefined) return null;
  const size = p.ghost ? 0 : own.reduce((sum, b) => sum + b.tokens, 0);
  return (
    <div
      className={styles.outline}
      aria-hidden="true"
      data-ghost={p.ghost ? '' : undefined}
      style={vars({ '--s': pct(start, p.window.tokens), '--z': pct(size, p.window.tokens) })}
    />
  );
}

function Lines({ p }: { readonly p: ContextWindowProps }) {
  return p.window.lines.map((line) => (
    <div
      key={line.id}
      className={styles.line}
      aria-hidden="true"
      data-crossed={line.tokens <= p.frame.used ? '' : undefined}
      style={vars({ '--f': line.tokens / p.window.tokens })}
    />
  ));
}

function Labels({ p, say }: Part) {
  return (
    <div className={styles.labels}>
      {p.window.lines.map((line) => (
        <div
          key={line.id}
          className={styles.label}
          data-crossed={line.tokens <= p.frame.used ? '' : undefined}
          style={vars({ '--f': line.tokens / p.window.tokens })}
        >
          {line.label} <b className="font-semibold">{line.short}</b>
        </div>
      ))}
      <div className={styles.labelLimit}>{fill(say.words.limit, { window: k(say, p.window.tokens) })}</div>
    </div>
  );
}

/** The bar's own layers: blocks, the buffer, the lit outline, the lens and the smart-zone lines. */
function BarLayers({ p, say, hot, at }: Part & { readonly hot: string; readonly at: number | null }) {
  const places = useMemo(() => firstPlaces(p.frames), [p.frames]);
  return (
    <>
      <Blocks p={p} say={say} places={places} hot={hot} />
      <div
        className={styles.buffer}
        aria-hidden="true"
        style={vars({ '--z': pct(p.window.bufferTokens, p.window.tokens) })}
      />
      <Outline p={p} places={places} />
      {at === null ? null : <Lens p={p} at={at} />}
      <Lines p={p} />
    </>
  );
}

function Bar({ p, say }: Part) {
  const bar = useRef<HTMLDivElement>(null);
  const loupe = useLoupe(bar, !say.tech);
  const hot = loupe.at === null ? '' : loupeRows(p.frame.blocks, loupe.at, p.window.tokens).cursor;
  return (
    <>
      <div
        ref={bar}
        className={styles.bar}
        role="group"
        aria-label={say.words.bar}
        data-roving=""
        onKeyDown={rove}
        {...loupe.handlers}
      >
        <BarLayers p={p} say={say} hot={hot} at={loupe.at} />
      </div>
      <Labels p={p} say={say} />
      {loupe.at === null ? null : (
        <Loupe p={p} say={say} at={loupe.at} bar={bar} onEnter={loupe.stay} onLeave={loupe.leave} />
      )}
    </>
  );
}

export function ContextWindow(p: ContextWindowProps) {
  const say = useSay(p);
  return (
    <section className={styles.ctx} aria-label={say.words.contextWindow} data-view={say.tech ? 'grid' : 'bar'}>
      <div className={styles.head}>
        <b className="font-semibold">{say.words.contextWindow}</b>
        <WindowSwitch p={p} say={say} />
        <Meter p={p} say={say} />
      </div>
      <div className={styles.ctxbody}>
        {say.tech ? <Grid p={p} say={say} onKeyDown={rove} /> : <Bar p={p} say={say} />}
        {p.children}
      </div>
    </section>
  );
}
