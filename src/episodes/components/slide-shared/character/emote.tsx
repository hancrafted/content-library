import type React from 'react';
import type { EmoteProps, Mood } from './actor';
import styles from './emote.module.css';
import { SaysFit } from './says-fit.client';
import { SAYS_FRAME as BUBBLE, saysPlace } from './says.pure';

const MARK: Record<Mood, string> = {
  confused: 'question',
  surprised: 'exclamation',
  happy: 'sparkle',
  thinking: 'thought-dots',
  blank: 'thought-empty',
};

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

type Side = 1 | -1;
const sideOf = (facing: EmoteProps['facing']): Side => (facing === 'left' ? -1 : 1);

function Words({ words, side, width }: { readonly words: string; readonly side: Side; readonly width: number }) {
  return (
    <foreignObject
      x={side === 1 ? 0 : -width}
      y={-BUBBLE.height}
      width={width}
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
  readonly place?: EmoteProps['bubble'];
}

function SpeechBubble({ words, mood, facing, place }: BubbleProps) {
  const side = sideOf(facing);
  const { x, bottom: foot, tip, base } = saysPlace(mood);
  const bottom = foot - (place?.lift ?? 0);
  const [near, far, point] = [base[0] * side, base[1] * side, `${tip[0] * side},${tip[1]}`];
  return (
    <g data-says-bubble data-motion="emote" className={styles.pop}>
      <g transform={`translate(${x * side} ${bottom})`}>
        <SaysFit side={side}>
          <Words words={words} side={side} width={place?.width ?? BUBBLE.width} />
        </SaysFit>
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

function EmoteMark({ mood, facing }: { readonly mood: Mood; readonly facing: EmoteProps['facing'] }) {
  const mirror = sideOf(facing) === -1 && mood !== 'confused';
  return (
    <g data-emote-mark={MARK[mood]} data-motion="emote" className={styles.pop}>
      <g transform={mirror ? 'scale(-1 1)' : undefined}>{MARKS[mood]()}</g>
    </g>
  );
}

// decision: docs/adr/0025-scene-figures-are-deep-modules.md
export function Emote({ mood, says, at, facing, bubble }: EmoteProps) {
  const words = (says ?? '').trim();
  if (!mood && !words) return null;
  return (
    <g data-emote transform={`translate(${at.x} ${at.y})`}>
      {mood && <EmoteMark mood={mood} facing={facing} />}
      {words && <SpeechBubble words={words} mood={mood} facing={facing} place={bubble} />}
    </g>
  );
}
