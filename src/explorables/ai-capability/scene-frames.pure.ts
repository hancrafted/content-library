/*
 * The four scenes of the interface lane as frames: each frame is a full snapshot of what its scene shows and how long it
 * holds, so the client part only steps an index and every choreography rule is a plain array a test can read. A dot
 * travels the wire to the model (`down`) or back (`up`); a message names the word it shows by key.
 */

export const LEVELS = ['prompting', 'agents', 'workflows', 'factory'] as const;
export type Level = (typeof LEVELS)[number];

export interface Message {
  readonly from: 'me' | 'ai' | 'tool';
  readonly key: string;
}

export const NODES = ['a', 'b1', 'b2', 'b3', 'c'] as const;
export type Node = (typeof NODES)[number];
export type NodeState = 'idle' | 'active' | 'done';

export type FactoryStep = 'enter' | 'down' | 'up' | 'leave';

export interface Job {
  readonly id: number;
  readonly lane: number;
  readonly step: FactoryStep;
}

export const AGENT_LOOPS = 3;

export interface Frame {
  readonly messages: readonly Message[];
  readonly dot?: { readonly dir: 'down' | 'up'; readonly count: number };
  readonly loop?: number | 'done';
  readonly nodes?: Readonly<Record<Node, NodeState>>;
  readonly running?: boolean;
  readonly jobs?: readonly Job[];
  /** How long the frame holds, in ms. */
  readonly ms: number;
}

const TRAVEL = 750;
const READ = 700;
const PAUSE = 1400;

const me = (key: string): Message => ({ from: 'me', key });
const ai = (key: string): Message => ({ from: 'ai', key });
const tool = (key: string): Message => ({ from: 'tool', key });

function roundTrip(messages: readonly Message[], extra: Partial<Frame> = {}, count = 1): Frame[] {
  return [
    { ...extra, messages, dot: { dir: 'down', count }, ms: TRAVEL },
    { ...extra, messages, dot: { dir: 'up', count }, ms: TRAVEL },
  ];
}

function prompting(): Frame[] {
  const asked = [me('prompt')];
  return [
    { messages: [], ms: READ },
    { messages: asked, ms: READ },
    ...roundTrip(asked),
    { messages: [...asked, ai('answer')], ms: PAUSE },
  ];
}

function agents(): Frame[] {
  const asked = [me('agentPrompt')];
  const firstTool = [...asked, tool('tool1')];
  const secondTool = [...firstTool, tool('tool2')];
  return [
    { messages: [], ms: READ },
    { messages: asked, ms: READ },
    ...roundTrip(asked, { loop: 1 }),
    { messages: firstTool, loop: 1, ms: READ },
    ...roundTrip(firstTool, { loop: 2 }),
    { messages: secondTool, loop: 2, ms: READ },
    ...roundTrip(secondTool, { loop: AGENT_LOOPS }),
    { messages: [...secondTool, ai('agentAnswer')], loop: 'done', ms: PAUSE },
  ];
}

function graph(active: readonly Node[], done: readonly Node[]): Record<Node, NodeState> {
  const state = (node: Node): NodeState => (done.includes(node) ? 'done' : active.includes(node) ? 'active' : 'idle');
  return Object.fromEntries(NODES.map((node) => [node, state(node)])) as Record<Node, NodeState>;
}

function workflows(): Frame[] {
  const steps: readonly (readonly Node[])[] = [['a'], ['b1', 'b2', 'b3'], ['c']];
  const frames: Frame[] = [{ messages: [], nodes: graph([], []), ms: READ }];
  const done: Node[] = [];
  for (const step of steps) {
    frames.push(...roundTrip([], { nodes: graph(step, done) }, step.length));
    done.push(...step);
    frames.push({ messages: [], nodes: graph([], done), ms: READ });
  }
  frames.push({ messages: [], nodes: graph([], done), ms: PAUSE });
  return frames;
}

/** A fixed pseudo-random sequence in [0, 1): arrivals look uneven, yet every play and every test sees the same ones. */
function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

/** The factory runs on a fast clock: one tick, and each step's length in ticks (a trip matches the dot's 0.6s). */
const TICK = 150;
const STEPS: readonly (readonly [FactoryStep, number])[] = [
  ['enter', 4],
  ['down', 4],
  ['up', 4],
  ['leave', 4],
];
const LIFE = STEPS.reduce((sum, [, ticks]) => sum + ticks, 0);
const LANES = 5;
const ARRIVING = 60;

function stepAt(age: number): FactoryStep {
  let left = age;
  for (const [step, ticks] of STEPS) {
    if (left < ticks) return step;
    left -= ticks;
  }
  return 'leave';
}

interface Started {
  readonly id: number;
  readonly lane: number;
  readonly start: number;
}

function arrival(live: readonly Started[], id: number, tick: number): Started | null {
  const lane = Array.from({ length: LANES }, (_, each) => each).find((each) => !live.some((job) => job.lane === each));
  return lane === undefined ? null : { id, lane, start: tick };
}

function factory(): Frame[] {
  const random = seeded(7);
  const frames: Frame[] = [];
  let started: Started[] = [];
  let due = 0;
  for (let tick = 0; tick < ARRIVING || started.length > 0; tick += 1) {
    started = started.filter((job) => tick - job.start < LIFE);
    const next = tick >= due && tick < ARRIVING ? arrival(started, tick, tick) : null;
    if (next) {
      started = [...started, next];
      due = tick + 1 + Math.floor(random() * 3);
    }
    if (started.length === 0) break;
    const jobs = started.map(({ id, lane, start }) => ({ id, lane, step: stepAt(tick - start) }));
    frames.push({ messages: [], running: true, jobs, ms: TICK });
  }
  frames.push({ messages: [], jobs: [], ms: PAUSE });
  return frames;
}

export const SCENES: Readonly<Record<Level, readonly Frame[]>> = {
  prompting: prompting(),
  agents: agents(),
  workflows: workflows(),
  factory: factory(),
};

export function finalFrame(level: Level): Frame {
  const frames = SCENES[level];
  const last = frames[frames.length - 1];
  if (last === undefined) throw new Error(`ai-capability: scene "${level}" has no frames`);
  return last;
}

export interface WireDot {
  readonly key: string;
  readonly dir: 'down' | 'up';
  readonly lane: number;
  readonly delay: number;
}

const STAGGER_MILLISECONDS = 100;

export function onWire(frame: Frame): WireDot[] {
  const { dot, jobs = [] } = frame;
  const batch = dot
    ? Array.from({ length: dot.count }, (_, index) => ({
        key: `${dot.dir}-${index}`,
        dir: dot.dir,
        lane: index - (dot.count - 1) / 2,
        delay: index * STAGGER_MILLISECONDS,
      }))
    : [];
  const requests = jobs.flatMap(({ id, lane, step }) =>
    step === 'down' || step === 'up'
      ? [{ key: `${id}-${step}`, dir: step, lane: lane - (LANES - 1) / 2, delay: 0 }]
      : [],
  );
  return [...batch, ...requests];
}
