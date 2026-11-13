import type { CSSProperties } from 'react';
import type { ActorProps } from './actor';
import styles from './character.module.css';
import { Emote } from './emote';
import {
  drawFigure,
  facetPath,
  GROUPS,
  MOTIONS,
  type FigureDrawing,
  type Group,
  type Motion,
  type Point,
  type Pose,
} from './poses.pure';
import type { Preset } from './preset';

export type { Motion, Pose } from './poses.pure';
export type { Preset } from './preset';

export interface CharacterProps extends ActorProps {
  /** Who is drawn: appearance only. Presets live with their setting (`deep-sea-expedition/cast.ts`) or in `shared-presets.ts`. */
  readonly preset: Preset;
  /** `stand` when left out. */
  readonly pose?: Pose;
  /** Plays once when the Slide's mount turns `[data-zone="active"]`, then rests in the pose. */
  readonly motion?: Motion;
  /** Faces left instead of right; the emote's words stay readable. */
  readonly flip?: boolean;
}

/** What each motion moves, how long it plays (ms), and where it pivots. */
const MOTION_PARTS: Record<
  Motion,
  { readonly groups: readonly Group[]; readonly ms: number; readonly pivot: 'neck' | 'shoulder' }
> = {
  wave: { groups: ['front-arm'], ms: 1200, pivot: 'shoulder' },
  nod: { groups: ['head-back', 'head'], ms: 700, pivot: 'neck' },
  'turn-to': { groups: ['head-back', 'head'], ms: 750, pivot: 'neck' },
};

/** The emote pops in this long after its figure's motion has ended. */
const EMOTE_AFTER_MS = 100;

interface GroupProps {
  readonly group: Group;
  readonly drawing: FigureDrawing;
  readonly motion?: Motion;
}

/** One paint group; a moving one turns about its pivot, moved to its own origin so the CSS rotates from `0 0`. */
function FigureGroup({ group, drawing, motion }: GroupProps) {
  const paths = drawing.groups[group].map((facet, index) => (
    <path key={index} d={facetPath(facet)} className={styles[facet.tone]} />
  ));
  if (!motion || !MOTION_PARTS[motion].groups.includes(group)) return <g data-group={group}>{paths}</g>;
  const [px, py]: Point = drawing.pivots[MOTION_PARTS[motion].pivot];
  const lift = motion === 'wave' ? ({ '--lift': `${drawing.waveLift}deg` } as CSSProperties) : undefined;
  return (
    <g transform={`translate(${px} ${py})`}>
      <g data-group={group} data-motion={motion} className={styles[motion]} style={lift}>
        <g transform={`translate(${-px} ${-py})`}>{paths}</g>
      </g>
    </g>
  );
}

/** The emote waits for its figure's motion; refuses a motion the figure does not know. */
function emoteDelay(motion: Motion | undefined): CSSProperties | undefined {
  if (motion === undefined) return undefined;
  if (!MOTIONS.includes(motion)) {
    throw new Error(`Character has no motion "${motion}"; motions are ${MOTIONS.join(', ')}.`);
  }
  return { '--emote-delay': `${MOTION_PARTS[motion].ms + EMOTE_AFTER_MS}ms` } as CSSProperties;
}

/** The preset's look as data attributes, which `character.module.css` turns into its palette. */
const looks = (preset: Preset) => ({
  'data-kind': preset.kind,
  'data-skin': preset.skin,
  'data-hair-tone': preset.hairTone ?? 'brown',
  'data-outfit': preset.outfit,
  'data-prop': preset.prop,
});

/**
 * A person in the low-poly Iceberg style (design-ADR 0025, "Scene figures are deep modules"): one human body plan for
 * every preset, so any preset takes any pose (`stand`, `sit` at a console on its own chair, `point`, `steer` a helm,
 * `hold` its prop forward), any motion (`wave`, `nod`, `turn-to`) and any mood. An SVG group a Scene places inside its
 * own `<svg>` with a `transform` or its `Travel` wrapper; `(0, 0)` is the floor between the feet, the figure stands
 * about 106 units tall and faces right unless `flip`.
 *
 * The figure implements the actor contract: its `mood` and `says` show as an `Emote` at its own head anchor, in every
 * pose, after its motion. Colours are slide-local custom properties derived from the global tokens in
 * `character.module.css`; only a `kind: 'ai'` preset shows a meaning colour, its `ai` tag.
 */
export function Character({ preset, pose = 'stand', motion, mood, says, flip = false }: CharacterProps) {
  const delay = emoteDelay(motion);
  const drawing = drawFigure(preset, pose, mood);
  const anchor = flip ? { x: -drawing.anchor.x, y: drawing.anchor.y } : drawing.anchor;
  return (
    <g data-character data-pose={pose} {...looks(preset)} className={styles.character} style={delay}>
      <g data-figure transform={flip ? 'scale(-1 1)' : undefined} className={styles.figure}>
        {GROUPS.filter((group) => drawing.groups[group].length > 0).map((group) => (
          <FigureGroup key={group} group={group} drawing={drawing} motion={motion} />
        ))}
      </g>
      <Emote mood={mood} says={says} at={anchor} facing={flip ? 'left' : 'right'} />
    </g>
  );
}
