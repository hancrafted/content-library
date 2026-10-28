import styles from './ai-capability.module.css';
import type { SceneWords } from './ai-capability.types';
import { NODES, type Frame, type Node, type NodeState } from './scene-frames.pure';

/** Where each agent sits in the graph: one, a fan-out of three, one. */
const AT: Record<Node, readonly [number, number]> = {
  a: [30, 88],
  b1: [110, 34],
  b2: [110, 88],
  b3: [110, 142],
  c: [190, 88],
};
const EDGES: readonly (readonly [Node, Node])[] = [
  ['a', 'b1'],
  ['a', 'b2'],
  ['a', 'b3'],
  ['b1', 'c'],
  ['b2', 'c'],
  ['b3', 'c'],
];
const BOX: Record<NodeState, string> = {
  idle: 'fill-card stroke-border',
  active: 'fill-(--tone)/10 stroke-(--tone)',
  done: 'fill-(--success) stroke-(--success)',
};

/** The node label drawn smaller than the caption role, by scaling the text: it must fit a node 44 units wide. */
const LABEL_SCALE = 0.6;

/** One agent of the graph: idle, active with its loading bar, or done with a tick. */
function AgentNode({ node, state, label }: { readonly node: Node; readonly state: NodeState; readonly label: string }) {
  const [x, y] = AT[node];
  return (
    <g data-node={node} data-state={state} transform={`translate(${x - 22},${y - 14})`}>
      <rect width="44" height="28" rx="6" strokeWidth="1.5" className={`transition-colors ${BOX[state]}`} />
      {state === 'done' ? (
        <path d="M15 14l5 5 9-10" className="fill-none stroke-background" strokeWidth="2.5" />
      ) : (
        <text
          transform={`translate(22 13) scale(${LABEL_SCALE})`}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground text-caption font-semibold"
        >
          {label}
        </text>
      )}
      {state === 'active' && (
        <rect x="6" y="20" width="32" height="3" rx="1.5" className={`${styles.load} fill-(--tone)`} />
      )}
    </g>
  );
}

/**
 * The workflow's graph (a pure view): agents fan out from one to three and back into one. An active agent shows a
 * loading bar while it calls the model; a done one turns green with a tick.
 */
export function WorkflowSceneView({ frame, words }: { readonly frame: Frame; readonly words: SceneWords }) {
  return (
    <svg viewBox="0 0 220 176" className="absolute inset-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)]" aria-hidden="true">
      {EDGES.map(([from, to]) => (
        <line
          key={`${from}-${to}`}
          x1={AT[from][0]}
          y1={AT[from][1]}
          x2={AT[to][0]}
          y2={AT[to][1]}
          className="stroke-border"
          strokeWidth="1.5"
        />
      ))}
      {NODES.map((node) => (
        <AgentNode key={node} node={node} state={frame.nodes?.[node] ?? 'idle'} label={words.agent} />
      ))}
    </svg>
  );
}
