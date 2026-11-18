import type { WorkflowWords } from './brief-or-pay-the-price.types';
import type { MoveId, TraitId } from './brief-or-pay-the-price.types';
import type { Layout, PlainScenario, ScenarioWords } from './scenario.types';

export type WorkflowViewWords = Pick<WorkflowWords, 'goal' | 'thenGoal' | 'zoomNode'>;

export type CountersTest = (move: MoveId, trait: TraitId) => boolean;

export interface WorkflowViewProps {
  readonly scenario: PlainScenario;
  readonly layout: Layout;
  readonly words: ScenarioWords;
  readonly ui: WorkflowViewWords;
  readonly step: number;
  readonly counters?: CountersTest;
}
