/*
 * The four scenes of the interface lane as frames: each frame is a full snapshot of what its scene shows and how long it
 * holds, so the client part only steps an index and every choreography rule is a plain array a test can read. A dot
 * travels the wire to the model (`down`) or back (`up`); a message names the word it shows by key.
 */

/** The four disciplines, left to right: each owns one column, one scene and one wire to the model. */
export const DISCIPLINES = ['prompting', 'agents', 'workflows', 'factory'] as const;
export type Discipline = (typeof DISCIPLINES)[number];

/** Who a chat line comes from: the person, the model, or a tool the agent reached for. */
export interface Message {
  readonly from: 'me' | 'ai' | 'tool';
  /** The word key the line shows, under the scene's words. */
  readonly key: string;
}

/** The agents of the workflow's graph: one, a fan-out of three, one. */
export const NODES = ['a', 'b1', 'b2', 'b3', 'c'] as const;
export type Node = (typeof NODES)[number];
export type NodeState = 'idle' | 'active' | 'done';

export interface Frame {
  readonly messages: readonly Message[];
  /** A message on its way along the wire, and how many travel side by side. */
  readonly dot?: { readonly dir: 'down' | 'up'; readonly count: number };
  /** The agent's loop counter: the round it is in, `done` at the end. */
  readonly loop?: number | 'done';
  readonly nodes?: Readonly<Record<Node, NodeState>>;
  /** The factory's belt runs. */
  readonly running?: boolean;
  /** How long the frame holds, in ms. */
  readonly ms: number;
}

const TRAVEL = 600;
const READ = 700;
const PAUSE = 1400;

const me = (key: string): Message => ({ from: 'me', key });
const ai = (key: string): Message => ({ from: 'ai', key });
const tool = (key: string): Message => ({ from: 'tool', key });

/** One round trip to the model under the messages shown so far: down, then up. */
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
    ...roundTrip(secondTool, { loop: 2 }),
    { messages: [...secondTool, ai('agentAnswer')], loop: 'done', ms: PAUSE },
  ];
}

/** The graph with `active` and `done` agents set, the rest idle. */
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

/** The factory: requests in, results out, many messages at once, its inside never shown. */
function factory(): Frame[] {
  const busy = { running: true };
  const BATCH = 3;
  return [...roundTrip([], busy, BATCH), ...roundTrip([], busy, BATCH), { messages: [], ...busy, ms: PAUSE }];
}

export const SCENES: Readonly<Record<Discipline, readonly Frame[]>> = {
  prompting: prompting(),
  agents: agents(),
  workflows: workflows(),
  factory: factory(),
};

/** What a scene shows once played through: its at-rest picture under reduced motion and in the static export. */
export function finalFrame(discipline: Discipline): Frame {
  const frames = SCENES[discipline];
  const last = frames[frames.length - 1];
  if (last === undefined) throw new Error(`ai-disciplines: scene "${discipline}" has no frames`);
  return last;
}
