import type { MatrixWords } from './brief-or-pay-the-price.types';
import { format } from './matrix-data.pure';
import type { ScenarioNode, ScenarioWords } from './scenario.types';

export interface RoleStripProps {
  readonly words: MatrixWords;
  readonly node: ScenarioNode;
  readonly said: ScenarioWords;
}

export function RoleStripView({ words, node, said }: RoleStripProps) {
  const text = said.nodes[node.id];
  const stage = said.stages[node.stage];
  if (text === undefined || stage === undefined) return null;
  return (
    <div
      data-role-strip={node.id}
      className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg border border-ai/40 bg-ai/10 px-3 py-2"
    >
      <span className="text-caption font-semibold tracking-wide text-muted-foreground uppercase">
        {format(words.stage, { stage: stage.name })}
      </span>
      <b className="text-body font-semibold">{text.label}</b>
      <span className="text-body text-muted-foreground">{text.role}</span>
      <span className="ml-auto text-caption text-ai">{format(words.inPlay, { count: node.cells.length })}</span>
    </div>
  );
}
