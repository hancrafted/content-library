import { memo, useEffect, useMemo, useRef, type KeyboardEvent } from 'react';
import { fullTokens } from './context-format.pure';
import type { ContextWindowProps } from './context-parts.types';
import { matcher } from './context-state.pure';
import { gridBoxes, type GridBox } from './context-usage.pure';
import { catLabel, fill, type Say } from './context-view';
import styles from './context.module.css';
import { colourOf } from './context.pure';
import type { Category } from './context.types';
import { Moves } from './moves.client';
import { Glyph, tint } from './window-bits';

const flag = (on: boolean) => (on ? '' : undefined);

type Kind = 'used' | 'free' | 'buffer';
type Morph = 'fill' | 'empty';
const MORPH: Readonly<Record<string, Morph>> = { 'free>used': 'fill', 'used>free': 'empty' };

interface Morphing {
  readonly morph: Morph | undefined;
  readonly delay: number;
}

function useMorphs(kinds: readonly Kind[]): readonly Morphing[] {
  const last = useRef<readonly Kind[] | null>(null);
  const before = last.current ?? kinds.map((kind) => (kind === 'buffer' ? 'buffer' : 'free'));
  useEffect(() => {
    last.current = kinds;
  });
  let order = 0;
  return kinds.map((kind, i) => {
    const morph = MORPH[`${before[i]}>${kind}`];
    return { morph, delay: morph ? Math.min(order++, 40) * 8 : 0 };
  });
}

type Role = 'button' | 'repeat' | 'inert';

interface BoxProps {
  readonly say: Say;
  readonly box: GridBox;
  readonly role: Role;
  readonly tab: boolean;
  readonly morph: Morph | undefined;
  readonly delay: number;
  readonly stepNo: number;
  readonly on: boolean;
  readonly pressed: boolean;
}

function usedAttrs(props: BoxProps & { readonly box: Extract<GridBox, { kind: 'used' }> }) {
  const { say, box, role, tab, delay, stepNo, on, pressed } = props;
  const part = `${box.id}@${box.cat}`;
  const style = tint(colourOf(box.cat, say.tech ? 'technical' : 'simple'), { '--md': `${delay}ms` });
  const lit = { 'data-part': part, 'data-on': flag(on), style };
  if (role !== 'button') return lit;
  const label = fill(say.words.boxLabel, { step: stepNo, category: catLabel(say, box.cat) });
  return {
    ...lit,
    type: 'button' as const,
    tabIndex: tab ? 0 : -1,
    'aria-pressed': pressed,
    'aria-label': label,
  };
}

function boxAttrs(props: BoxProps) {
  const { box, morph } = props;
  const base = { className: styles.box, 'data-morph': morph };
  if (box.kind === 'used') return { ...base, ...usedAttrs({ ...props, box }) };
  return { ...base, 'data-free': flag(box.kind === 'free'), 'data-buffer': flag(box.kind === 'buffer') };
}

const Box = memo(function Box(props: BoxProps) {
  const glyph = <Glyph kind={props.box.kind} />;
  const trigger = `${props.box.kind}|${props.morph}|${props.box.kind === 'used' ? props.pressed : ''}`;
  if (props.role === 'button')
    return (
      <Moves as="button" trigger={trigger} {...boxAttrs(props)}>
        {glyph}
      </Moves>
    );
  return (
    <Moves as="span" trigger={trigger} {...boxAttrs(props)} aria-hidden="true">
      {glyph}
    </Moves>
  );
});

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

function usedOf(
  box: GridBox,
  from: { match: (id: string, cat: Category) => boolean; pinned: string | null; stepOf: ReadonlyMap<string, number> },
) {
  if (box.kind !== 'used') return { stepNo: 0, on: false, pressed: false };
  return {
    stepNo: from.stepOf.get(box.id) ?? 0,
    on: from.match(box.id, box.cat),
    pressed: from.pinned === `${box.id}@${box.cat}`,
  };
}

interface GridProps {
  readonly p: ContextWindowProps;
  readonly say: Say;
  readonly onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

export function Grid({ p, say, onKeyDown }: GridProps) {
  const { frame, window, lit, pinned, stepOf } = p;
  const boxes = useMemo(() => gridBoxes(frame, window), [frame, window]);
  const morphs = useMorphs(boxes.map((box) => box.kind));
  const roles = useMemo(() => rolesOf(boxes), [boxes]);
  const match = useMemo(() => matcher(lit), [lit]);
  const label = fill(say.words.grid, { tokens: fullTokens(window.tokens / 100, say.locale) });
  return (
    <div className={styles.grid} role="group" aria-label={label} data-roving="" onKeyDown={onKeyDown}>
      {boxes.map((box, i) => (
        <Box
          key={i}
          say={say}
          box={box}
          role={roles[i] ?? 'inert'}
          tab={i === 0}
          morph={morphs[i]?.morph}
          delay={morphs[i]?.delay ?? 0}
          {...usedOf(box, { match, pinned, stepOf })}
        />
      ))}
    </div>
  );
}
