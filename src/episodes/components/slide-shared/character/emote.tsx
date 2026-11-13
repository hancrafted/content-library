import type React from 'react';
import type { EmoteProps, Mood } from './actor';
import styles from './emote.module.css';

/** The cartoon mark each mood shows above the head. */
const MARK: Record<Mood, string> = {
  confused: 'question',
  surprised: 'exclamation',
  happy: 'sparkle',
  thinking: 'thought-dots',
  blank: 'thought-empty',
};

const THOUGHT_MOODS: ReadonlySet<Mood> = new Set(['thinking', 'blank']);

/** A lumpy, faceted thought cloud around (18, -22): twelve points alternating between two radii. */
const CLOUD = Array.from({ length: 12 }, (_, index) => {
  const angle = (index / 12) * Math.PI * 2;
  const bulge = index % 2 === 0 ? 1 : 0.8;
  return `${(18 + Math.cos(angle) * 12 * bulge).toFixed(1)},${(-22 + Math.sin(angle) * 8.5 * bulge).toFixed(1)}`;
}).join(' ');

const QUESTION = 'M-3.5 -20.5C-3.5 -25.5 3.5 -25.5 3.5 -21C3.5 -18 0 -17.5 0 -14';
const EXCLAMATION = '-1.7,-25.5 1.7,-25.5 0.9,-14 -0.9,-14';
const SPARKLE = (cx: number, cy: number, r: number) =>
  [
    [cx, cy - r],
    [cx + r * 0.28, cy - r * 0.28],
    [cx + r, cy],
    [cx + r * 0.28, cy + r * 0.28],
    [cx, cy + r],
    [cx - r * 0.28, cy + r * 0.28],
    [cx - r, cy],
    [cx - r * 0.28, cy - r * 0.28],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(' ');

function Dot({ y }: { readonly y: number }) {
  return (
    <>
      <circle cx={0} cy={y} r={2.5} className="fill-card" />
      <circle cx={0} cy={y} r={1.5} className="fill-foreground" />
    </>
  );
}

function Question() {
  return (
    <>
      <path d={QUESTION} strokeWidth={4.6} strokeLinecap="round" className="fill-none stroke-card" />
      <path d={QUESTION} strokeWidth={2.2} strokeLinecap="round" className="fill-none stroke-foreground" />
      <Dot y={-9.5} />
    </>
  );
}

function Exclamation() {
  return (
    <>
      <polygon
        points={EXCLAMATION}
        strokeWidth={2}
        strokeLinejoin="round"
        className="fill-foreground stroke-card [paint-order:stroke]"
      />
      <Dot y={-9.5} />
    </>
  );
}

function Sparkle() {
  return (
    <>
      <polygon points={SPARKLE(9, -14, 6)} strokeWidth={0.8} className="fill-(--bulb) stroke-(--bulb-edge)" />
      <polygon points={SPARKLE(15.5, -21, 3)} strokeWidth={0.6} className="fill-(--bulb) stroke-(--bulb-edge)" />
    </>
  );
}

/** A thought bubble rising from the head: three dots while thinking, empty when the mind is blank. */
function Thought({ dots }: { readonly dots: boolean }) {
  return (
    <>
      <circle cx={5} cy={-5} r={1.4} strokeWidth={0.8} className="fill-card stroke-muted-foreground" />
      <circle cx={8.5} cy={-10} r={2.3} strokeWidth={0.8} className="fill-card stroke-muted-foreground" />
      <polygon points={CLOUD} strokeWidth={0.8} strokeLinejoin="round" className="fill-card stroke-muted-foreground" />
      {dots && [13, 18, 23].map((x) => <circle key={x} cx={x} cy={-22} r={1.4} className="fill-foreground" />)}
    </>
  );
}

const MARKS: Record<Mood, () => React.ReactElement> = {
  confused: Question,
  surprised: Exclamation,
  happy: Sparkle,
  thinking: () => <Thought dots />,
  blank: () => <Thought dots={false} />,
};

/**
 * The speech bubble's box, drawn at half the figure's scale so caption-role text keeps a readable size beside a figure
 * that a Scene scales up (the Spec draws figures at 1.4 to 2.3): about 110 by 90 figure units, the text bottom-aligned.
 */
const BUBBLE = { width: 220, height: 180, scale: 0.5 } as const;

/**
 * Where the bubble sits, facing right: beside the head, or past a thought cloud with its tail from the head's front, so
 * the two never overlap. `x` is the bubble's near edge, `tip` the tail's point, `base` the tail's foot on the bubble.
 */
const BUBBLE_PLACE = {
  plain: { x: 10, bottom: -14, tip: [6, -7], base: [14, 21] },
  beside: { x: 34, bottom: -6, tip: [12, -3], base: [36, 43] },
} as const;

type Side = 1 | -1;
const sideOf = (facing: EmoteProps['facing']): Side => (facing === 'left' ? -1 : 1);

/** The words, bottom-aligned in the bubble's box and hugging the head's side of it. */
function Words({ words, side }: { readonly words: string; readonly side: Side }) {
  return (
    <foreignObject
      x={side === 1 ? 0 : -BUBBLE.width}
      y={-BUBBLE.height}
      width={BUBBLE.width}
      height={BUBBLE.height}
      overflow="visible"
    >
      <div className={side === 1 ? 'flex h-full items-end' : 'flex h-full items-end justify-end'}>
        <p
          data-says
          className="m-0 rounded-md border border-muted-foreground bg-card px-2 py-1 text-caption text-card-foreground"
        >
          {words}
        </p>
      </div>
    </foreignObject>
  );
}

interface BubbleProps {
  readonly words: string;
  readonly mood?: Mood;
  readonly facing: EmoteProps['facing'];
}

/** What the actor says, wrapped inside a bubble on the side it faces, its tail pointing at the head. */
function SpeechBubble({ words, mood, facing }: BubbleProps) {
  const side = sideOf(facing);
  const { x, bottom, tip, base } = BUBBLE_PLACE[mood && THOUGHT_MOODS.has(mood) ? 'beside' : 'plain'];
  const [near, far, point] = [base[0] * side, base[1] * side, `${tip[0] * side},${tip[1]}`];
  return (
    <g data-says-bubble className={styles.pop}>
      <g transform={`translate(${x * side} ${bottom}) scale(${BUBBLE.scale})`}>
        <Words words={words} side={side} />
      </g>
      <polygon points={`${point} ${near},${bottom - 1.5} ${far},${bottom - 1.5}`} className="fill-card" />
      <polyline
        points={`${near},${bottom - 0.4} ${point} ${far},${bottom - 0.4}`}
        strokeWidth={0.8}
        strokeLinejoin="round"
        className="fill-none stroke-muted-foreground"
      />
    </g>
  );
}

/** The mood's mark, turned to the side the figure faces; the question mark reads the same either way. */
function EmoteMark({ mood, facing }: { readonly mood: Mood; readonly facing: EmoteProps['facing'] }) {
  const mirror = sideOf(facing) === -1 && mood !== 'confused';
  return (
    <g data-emote-mark={MARK[mood]} className={styles.pop}>
      <g transform={mirror ? 'scale(-1 1)' : undefined}>{MARKS[mood]()}</g>
    </g>
  );
}

/**
 * The emote an actor shows at its head anchor (design-ADR 0025, "Scene figures are deep modules"): one cartoon mark per
 * mood (`confused` a question mark, `surprised` an exclamation mark, `happy` a sparkle, `thinking` a thought bubble with
 * dots, `blank` an empty thought bubble, the amnesiac AI), and `says` as a speech bubble whose text wraps inside it.
 *
 * `at` is the top of the head in the figure's own units; the mark sits just above it and the bubble rises on the side
 * the figure is `facing` (past the thought cloud when it thinks, so they never overlap). The question mark never
 * mirrors; the words never do. Both pop in once when the Slide's mount turns `[data-zone="active"]`, after the delay the figure sets in
 * `--emote-delay` (its own motion's length), and stay visible at rest; reduced motion shows them at rest at once.
 */
export function Emote({ mood, says, at, facing }: EmoteProps) {
  const words = (says ?? '').trim();
  if (!mood && !words) return null;
  return (
    <g data-emote transform={`translate(${at.x} ${at.y})`}>
      {mood && <EmoteMark mood={mood} facing={facing} />}
      {words && <SpeechBubble words={words} mood={mood} facing={facing} />}
    </g>
  );
}
