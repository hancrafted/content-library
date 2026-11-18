import { cn } from '@/shared/lib/utils';
import { MOVE_IDS, TRAIT_IDS } from './brief-or-pay-the-price.types';
import type { Cell, Layout, ScenarioNode } from './scenario.types';
import { SizedText } from './workflow-text';
import type { CountersTest, ScenarioWords, WorkflowViewWords } from './workflow.types';

const NODE_ROLE_LINES = 3;
const ROLE_CHARS_PER_PIXEL = 8.4;
const BADGE_STEP = 9;
const NARROW_NODE_WIDTH = 150;

export const wrapWords = (text: string, limit: number): string[] =>
  text.split(' ').reduce<string[]>((lines, word) => {
    const last = lines.at(-1);
    if (last !== undefined && `${last} ${word}`.length <= limit) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
    return lines;
  }, []);

type CellState = 'on' | 'context' | 'off';

const CELL_CLASS: Record<CellState, string> = {
  on: 'fill-ai',
  context: 'fill-none stroke-ai',
  off: 'fill-foreground/12',
};

const stateOf = (cell: Cell | undefined, counters: CountersTest): CellState => {
  if (cell === undefined) return 'off';
  return counters(cell.move, cell.trait) ? 'on' : 'context';
};

const cellOf = (node: ScenarioNode, move: string, trait: string): Cell | undefined =>
  node.cells.find((each) => each.move === move && each.trait === trait);

function BadgeCell({
  state,
  row,
  column,
}: {
  readonly state: CellState;
  readonly row: number;
  readonly column: number;
}) {
  return (
    <rect
      x={column * BADGE_STEP}
      y={row * BADGE_STEP}
      width={7}
      height={7}
      rx={1.5}
      data-cell={state}
      className={CELL_CLASS[state]}
      strokeWidth={1.2}
    />
  );
}

function Badge({
  node,
  rect,
  counters,
}: {
  readonly node: ScenarioNode;
  readonly rect: Layout['nodes'][string];
  readonly counters: CountersTest;
}) {
  return (
    <g transform={`translate(${rect.x + rect.w - 56},${rect.y + rect.h - 54})`} data-badge={node.id} aria-hidden="true">
      {MOVE_IDS.flatMap((move, row) =>
        TRAIT_IDS.map((trait, column) => (
          <BadgeCell
            key={`${move}/${trait}`}
            state={stateOf(cellOf(node, move, trait), counters)}
            row={row}
            column={column}
          />
        )),
      )}
    </g>
  );
}

interface NodeProps {
  readonly node: ScenarioNode;
  readonly layout: Layout;
  readonly words: ScenarioWords;
  readonly ui: WorkflowViewWords;
  readonly lit: boolean;
  readonly counters: CountersTest;
}

function Role({ rect, role }: { readonly rect: Layout['nodes'][string]; readonly role: string }) {
  if (rect.w < NARROW_NODE_WIDTH) return null;
  const lines = wrapWords(role, Math.floor((rect.w - 80) / ROLE_CHARS_PER_PIXEL)).slice(0, NODE_ROLE_LINES);
  return lines.map((line, index) => (
    <SizedText
      key={line}
      className="fill-muted-foreground"
      size={16}
      x={rect.x + 18}
      y={rect.y + 68 + index * 20}
      anchor="start"
    >
      {line}
    </SizedText>
  ));
}

function NodeBox({ rect, lit }: { readonly rect: Layout['nodes'][string]; readonly lit: boolean }) {
  const classes = cn(
    'fill-card motion-safe:transition-[stroke-width] motion-safe:duration-300',
    lit ? 'stroke-ai' : 'stroke-foreground',
  );
  return (
    <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} rx={8} className={classes} strokeWidth={lit ? 5 : 2} />
  );
}

const zoomLabel = (ui: WorkflowViewWords, text: { readonly label: string; readonly role: string }): string =>
  ui.zoomNode.replace('{label}', text.label).replace('{role}', text.role);

export function NodeView({ node, layout, words, ui, lit, counters }: NodeProps) {
  const rect = layout.nodes[node.id];
  const text = words.nodes[node.id];
  if (rect === undefined || text === undefined) return null;
  return (
    <g
      data-node={node.id}
      data-lit={lit}
      role="button"
      tabIndex={0}
      aria-label={zoomLabel(ui, text)}
      className="cursor-pointer outline-none"
    >
      <NodeBox rect={rect} lit={lit} />
      <SizedText className="fill-foreground font-semibold" size={26} x={rect.x + 18} y={rect.y + 40} anchor="start">
        {text.label}
      </SizedText>
      <Role rect={rect} role={text.role} />
      <Badge node={node} rect={rect} counters={counters} />
    </g>
  );
}
