import { useMemo, useRef, type KeyboardEvent } from 'react';
import { fullTokens, percentText } from './context-format.pure';
import { catLabel, fill, k, type View } from './context-view';
import styles from './context-window.module.css';
import { colourOf, type Frame, type PlacedBlock } from './context-window.pure';
import { tint, vars } from './window-bits';
import { Lens, Loupe, useLoupe } from './window-loupe';
import { Grid, Usage } from './window-usage';

/* The context view: the meter, the window switch, a fixed-height bar (Simple) or the /context grid (Technical). */

/** Every block of the chat at the place it first lands, so a block not in the window yet waits where it will land. */
function firstPlaces(frames: readonly Frame[]): ReadonlyMap<string, PlacedBlock> {
  const places = new Map<string, PlacedBlock>();
  for (const frame of frames)
    for (const block of frame.blocks) if (!places.has(block.key)) places.set(block.key, block);
  return places;
}

function Meter({ v }: { readonly v: View }) {
  const percent = percentText((v.frame.used / v.window.tokens) * 100, v.locale);
  const [before, after] = fill(v.words.meterValue, { used: k(v, v.frame.used), window: k(v, v.window.tokens) }).split(
    '{percent}',
  );
  return (
    <span className={styles.meterValue}>
      {before}
      <b className="text-body font-semibold">{percent}</b>
      {after}
    </span>
  );
}

function WindowSwitch({ v }: { readonly v: View }) {
  if (!v.preset.windowSwitch) return null;
  return (
    <div className={styles.windows} role="group" aria-label={v.words.windowGroup}>
      {v.preset.windows.map((size, i) => (
        <button
          key={size.tokens}
          type="button"
          aria-pressed={v.state.window === i}
          onClick={() => v.dispatch({ type: 'SET_WINDOW', value: i })}
        >
          {k(v, size.tokens).toUpperCase()}
        </button>
      ))}
    </div>
  );
}

const pct = (v: View, tokens: number) => (tokens / v.window.tokens) * 100;

function Blocks({ v, places }: { readonly v: View; readonly places: ReadonlyMap<string, PlacedBlock> }) {
  const now = new Map(v.frame.blocks.map((b) => [b.key, b]));
  const first = v.frame.blocks[0]?.key;
  return [...places.values()].map((block) => {
    const at = now.get(block.key) ?? block;
    const label = fill(v.words.blockLabel, {
      category: catLabel(v, block.cat),
      step: v.stepOf.get(block.id) ?? 0,
      tokens: fullTokens(at.tokens, v.locale),
    });
    return (
      <button
        key={block.key}
        type="button"
        className={styles.block}
        data-part={block.key}
        data-out={now.has(block.key) ? undefined : ''}
        data-on={now.has(block.key) && v.match(block.id, block.cat) ? '' : undefined}
        tabIndex={block.key === first ? 0 : -1}
        aria-pressed={v.state.pinned === block.key}
        aria-label={label}
        style={tint(colourOf(block.cat, v.state.depth), { '--s': pct(v, at.start), '--z': pct(v, at.tokens) })}
      />
    );
  });
}

/** One outline round a lit step's blocks, or a dashed empty one where a pinned step will land. */
function outlined(v: View, places: ReadonlyMap<string, PlacedBlock>): readonly PlacedBlock[] {
  if (v.ghost) return [...places.values()].filter((b) => b.id === v.ghost);
  if (!v.lit || v.lit.includes(':')) return [];
  const [id, cat] = v.lit.split('@');
  return v.frame.blocks.filter((b) => b.id === id && (!cat || b.cat === cat));
}

function Outline({ v, places }: { readonly v: View; readonly places: ReadonlyMap<string, PlacedBlock> }) {
  const own = outlined(v, places);
  const start = own[0]?.start;
  if (start === undefined) return null;
  const size = v.ghost ? 0 : own.reduce((sum, b) => sum + b.tokens, 0);
  return (
    <div
      className={styles.outline}
      aria-hidden="true"
      data-ghost={v.ghost ? '' : undefined}
      style={vars({ '--s': pct(v, start), '--z': pct(v, size) })}
    />
  );
}

function Lines({ v }: { readonly v: View }) {
  return v.window.lines.map((line) => (
    <div
      key={line.id}
      className={styles.line}
      aria-hidden="true"
      data-crossed={line.tokens <= v.frame.used ? '' : undefined}
      style={vars({ '--f': line.tokens / v.window.tokens })}
    />
  ));
}

function Labels({ v }: { readonly v: View }) {
  return (
    <div className={styles.labels}>
      {v.window.lines.map((line) => (
        <div
          key={line.id}
          className={styles.label}
          data-crossed={line.tokens <= v.frame.used ? '' : undefined}
          style={vars({ '--f': line.tokens / v.window.tokens })}
        >
          {line.label} <b className="font-semibold">{line.short}</b>
        </div>
      ))}
      <div className={styles.labelLimit}>{fill(v.words.limit, { window: k(v, v.window.tokens) })}</div>
    </div>
  );
}

interface Props {
  readonly v: View;
  readonly onRove: (event: KeyboardEvent<HTMLElement>) => void;
}

function Bar({ v, onRove }: Props) {
  const places = useMemo(() => firstPlaces(v.frames), [v.frames]);
  const bar = useRef<HTMLDivElement>(null);
  const loupe = useLoupe(bar, !v.tech);
  return (
    <>
      <div
        ref={bar}
        className={styles.bar}
        role="group"
        aria-label={v.words.bar}
        data-roving=""
        onKeyDown={onRove}
        {...loupe.handlers}
      >
        <Blocks v={v} places={places} />
        <div className={styles.buffer} aria-hidden="true" style={vars({ '--z': pct(v, v.window.bufferTokens) })} />
        <Outline v={v} places={places} />
        {loupe.at === null ? null : <Lens v={v} at={loupe.at} />}
        <Lines v={v} />
      </div>
      <Labels v={v} />
      {loupe.at === null ? null : <Loupe v={v} at={loupe.at} bar={bar} onEnter={loupe.stay} onLeave={loupe.leave} />}
    </>
  );
}

export function ContextColumn({ v, onRove }: Props) {
  return (
    <section className={styles.ctx} aria-label={v.words.contextWindow}>
      <div className={styles.head}>
        <b className="font-semibold">{v.words.contextWindow}</b>
        <WindowSwitch v={v} />
        <Meter v={v} />
      </div>
      <div className={styles.ctxbody}>
        {v.tech ? <Grid v={v} onKeyDown={onRove} /> : <Bar v={v} onRove={onRove} />}
        <Usage v={v} />
      </div>
    </section>
  );
}
