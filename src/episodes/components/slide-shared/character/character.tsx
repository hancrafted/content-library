import type { CSSProperties } from 'react';
import { Art } from '../art/art';
import { artName } from '../art/art.pure';
import type { ActorProps, BubblePlace } from './actor';
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
  readonly preset: Preset;
  readonly pose?: Pose;
  readonly motion?: Motion;
  readonly flip?: boolean;
  readonly bubble?: BubblePlace;
}

const MOTION_PARTS: Record<
  Motion,
  { readonly groups: readonly Group[]; readonly milliseconds: number; readonly pivot: 'neck' | 'shoulder' }
> = {
  wave: { groups: ['front-arm'], milliseconds: 1200, pivot: 'shoulder' },
  nod: { groups: ['head-back', 'head'], milliseconds: 700, pivot: 'neck' },
  'turn-to': { groups: ['head-back', 'head'], milliseconds: 750, pivot: 'neck' },
};

const EMOTE_AFTER_MILLISECONDS = 100;

interface GroupProps {
  readonly group: Group;
  readonly drawing: FigureDrawing;
  readonly motion?: Motion;
}

function FigureGroup({ group, drawing, motion }: GroupProps) {
  const paths = (
    <Art name={artName(`character/${group}`, drawing.groups[group])}>
      {drawing.groups[group].map((facet, index) => (
        <path key={index} d={facetPath(facet)} className={styles[facet.tone]} />
      ))}
    </Art>
  );
  if (!motion || !MOTION_PARTS[motion].groups.includes(group)) return <g data-group={group}>{paths}</g>;
  const [px, py]: Point = drawing.pivots[MOTION_PARTS[motion].pivot];
  const lift = motion === 'wave' ? ({ '--lift': `${drawing.waveLiftDegrees}deg` } as CSSProperties) : undefined;
  return (
    <g transform={`translate(${px} ${py})`}>
      <g data-group={group} data-motion={motion} className={styles[motion]} style={lift}>
        <g transform={`translate(${-px} ${-py})`}>{paths}</g>
      </g>
    </g>
  );
}

function emoteDelay(motion: Motion | undefined): CSSProperties | undefined {
  if (motion === undefined) return undefined;
  if (!MOTIONS.includes(motion)) {
    throw new Error(`Character has no motion "${motion}"; motions are ${MOTIONS.join(', ')}.`);
  }
  return { '--emote-delay': `${MOTION_PARTS[motion].milliseconds + EMOTE_AFTER_MILLISECONDS}ms` } as CSSProperties;
}

const looks = (preset: Preset) => ({
  'data-kind': preset.kind,
  'data-skin': preset.skin,
  'data-hair-tone': preset.hairTone ?? 'brown',
  'data-outfit': preset.outfit,
  'data-prop': preset.prop,
});

// decision: docs/decision-records/0025-scene-figures-are-deep-modules.md
export function Character({ preset, pose = 'stand', motion, mood, says, flip = false, bubble }: CharacterProps) {
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
      <Emote mood={mood} says={says} at={anchor} facing={flip ? 'left' : 'right'} bubble={bubble} />
    </g>
  );
}
