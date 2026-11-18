import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import { markerIdOf } from './annotation-arrow-view';
import { AnnotationView } from './annotation-views';
import { LETTERS, type Layout, type PlainScenario, type ScenarioWords } from './scenario.types';
import { annotationsOf, stepState, type Lit } from './workflow-annotations.pure';
import { NodeView } from './workflow-node-view';
import { SizedText } from './workflow-text';
import type { WorkflowViewProps, WorkflowViewWords } from './workflow.types';

const TRANSITION = 'motion-safe:transition-[stroke-width,fill] motion-safe:duration-300';

function Bands({ layout, lit }: { readonly layout: Layout; readonly lit: Lit }) {
  return (
    <g data-bands>
      {layout.stages.map((band) => (
        <rect
          key={band.id}
          data-band={band.id}
          data-lit={lit.stages.includes(band.id)}
          x={band.x + 6}
          y={band.y}
          width={band.w - 12}
          height={band.h}
          rx={18}
          className={cn(TRANSITION, lit.stages.includes(band.id) ? 'fill-ai/12' : 'fill-foreground/3')}
        />
      ))}
    </g>
  );
}

function Edges({ layout, lit }: { readonly layout: Layout; readonly lit: Lit }) {
  return (
    <g data-edges className="text-foreground">
      {layout.edges.map((edge) => {
        const on = lit.edges.includes(edge.id);
        return (
          <path
            key={edge.id}
            data-edge={edge.id}
            data-lit={on}
            d={edge.d}
            className={cn('fill-none', TRANSITION, on ? 'stroke-ai' : 'stroke-foreground')}
            strokeWidth={on ? 4.5 : 2}
            markerEnd={edge.arrow ? `url(#${markerIdOf(layout)})` : undefined}
          />
        );
      })}
    </g>
  );
}

const bandLetter = (scenario: PlainScenario, index: number): ReactNode =>
  scenario.acronym === undefined ? `${index + 1} · ` : <tspan className="fill-ai">{scenario.acronym[index]} </tspan>;

function BandLabels({
  scenario,
  layout,
  words,
}: {
  readonly scenario: PlainScenario;
  readonly layout: Layout;
  readonly words: ScenarioWords;
}) {
  return (
    <g data-band-labels>
      {layout.stages.map((band, index) => (
        <SizedText
          key={band.id}
          className="fill-muted-foreground font-semibold [paint-order:stroke] stroke-background stroke-[6px]"
          size={22}
          x={band.lx}
          y={band.ly}
          anchor={band.anchor}
        >
          {bandLetter(scenario, index)}
          {words.stages[band.id]?.name}
        </SizedText>
      ))}
    </g>
  );
}

function Goal({ layout, lit, ui }: { readonly layout: Layout; readonly lit: boolean; readonly ui: WorkflowViewWords }) {
  const { cx, cy, r } = layout.goal;
  return (
    <g data-goal data-lit={lit}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        className={cn('fill-card', lit ? 'stroke-ai' : 'stroke-foreground')}
        strokeWidth={lit ? 7 : 2}
      />
      <SizedText className="fill-foreground" size={52} x={cx} y={cy + 18}>
        🏁
      </SizedText>
      <SizedText className="fill-foreground font-semibold" size={24} x={cx} y={cy + r + 38}>
        {ui.goal}
      </SizedText>
    </g>
  );
}

const DIMS_WHEN_PAST = new Set(['arrow', 'group', 'mark']);

function Annotations({
  scenario,
  layout,
  words,
  step,
}: Pick<WorkflowViewProps, 'scenario' | 'layout' | 'words' | 'step'>) {
  const { isShown, isPast } = stepState(scenario, step);
  return (
    <g data-annotations className="text-ai">
      {LETTERS.map((letter) => (
        <g
          key={letter}
          data-letter={letter}
          data-shown={isShown(letter)}
          data-past={isPast(letter)}
          className={cn(!isShown(letter) && 'hidden')}
        >
          {annotationsOf(scenario, letter).map((annotation, index) => (
            <g key={index} className={cn(isPast(letter) && DIMS_WHEN_PAST.has(annotation.type) && 'opacity-35')}>
              <AnnotationView
                annotation={annotation}
                context={{ scenario, layout, words: words.annotations, past: isPast(letter) }}
              />
            </g>
          ))}
        </g>
      ))}
    </g>
  );
}

const Defs = ({ layout }: { readonly layout: Layout }) => (
  <defs>
    <marker
      id={markerIdOf(layout)}
      viewBox="0 0 10 10"
      refX={9}
      refY={5}
      markerWidth={8}
      markerHeight={8}
      orient="auto-start-reverse"
    >
      <path d="M0 0L10 5L0 10z" className="fill-current" />
    </marker>
  </defs>
);

const accessibleName = ({ scenario, words, ui }: WorkflowViewProps): string =>
  `${words.title}: ${scenario.nodes.map((node) => words.nodes[node.id]?.label ?? node.id).join(', ')}, ${ui.thenGoal}.`;

function Nodes({ scenario, layout, words, ui, step, counters = () => true }: WorkflowViewProps) {
  const { lit } = stepState(scenario, step);
  return scenario.nodes.map((node) => (
    <NodeView
      key={node.id}
      node={node}
      layout={layout}
      words={words}
      ui={ui}
      lit={lit.nodes.includes(node.id)}
      counters={counters}
    />
  ));
}

export function WorkflowView(props: WorkflowViewProps) {
  const { scenario, layout, words, ui, step } = props;
  const { lit } = stepState(scenario, step);
  const box = `0 0 ${layout.w} ${layout.h}`;
  return (
    <svg
      data-workflow
      data-orient={layout.orient}
      data-step={step}
      viewBox={box}
      role="group"
      aria-label={accessibleName(props)}
      className="h-auto w-full"
    >
      <Defs layout={layout} />
      <Bands layout={layout} lit={lit} />
      <Edges layout={layout} lit={lit} />
      <BandLabels scenario={scenario} layout={layout} words={words} />
      <Nodes {...props} />
      <Goal layout={layout} lit={lit.goal} ui={ui} />
      <Annotations scenario={scenario} layout={layout} words={words} step={step} />
    </svg>
  );
}
