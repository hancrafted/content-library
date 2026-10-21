import type { ReactNode } from 'react';
import type { Handoff } from '../handoff.pure';
import { ComparisonView } from './comparison-view';
import { DEFAULT_OUTPUT_WORDS, type OutputWords } from './output-words';
import { ResearchView } from './research-view';
import { SpecView } from './spec-view';
import { RequirementsView, TextView } from './text-view';
import { TicketGraph } from './ticket-graph.client';

export interface OutputViewProps {
  /** One parsed handoff block; the renderer is chosen by its `kind`. */
  readonly handoff: Handoff;
  /** Ids of the ticked tickets (tickets kind only); the parent owns them. */
  readonly ticked?: readonly string[];
  readonly onTick?: (id: string) => void;
  /** Labels over the English defaults. */
  readonly words?: Partial<OutputWords>;
}

const NO_TICKS: readonly string[] = [];
const NO_OP = () => undefined;

interface Context {
  readonly ticked: readonly string[];
  readonly onTick: (id: string) => void;
  readonly words: OutputWords;
}

type Renderers = {
  readonly [K in Handoff['kind']]: (handoff: Extract<Handoff, { kind: K }>, ctx: Context) => ReactNode;
};

const RENDERERS: Renderers = {
  spec: (spec, { words }) => <SpecView spec={spec} words={words} />,
  tickets: (handoff, { ticked, onTick, words }) => (
    <TicketGraph tickets={handoff.tickets} ticked={ticked} onTick={onTick} words={words} />
  ),
  research: (research, { words }) => <ResearchView research={research} words={words} />,
  comparison: (comparison, { words }) => <ComparisonView comparison={comparison} words={words} />,
  requirements: (requirements, { words }) => <RequirementsView requirements={requirements} words={words} />,
  text: (handoff) => <TextView text={handoff.text} />,
};

/** The one entry the renderers share: a parsed handoff in, the view of its kind out. */
export function OutputView({ handoff, ticked = NO_TICKS, onTick = NO_OP, words }: OutputViewProps) {
  const ctx = { ticked, onTick, words: { ...DEFAULT_OUTPUT_WORDS, ...words } };
  return (RENDERERS[handoff.kind] as (h: Handoff, c: Context) => ReactNode)(handoff, ctx);
}
