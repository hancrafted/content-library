import type { MoveId, TraitId } from './brief-or-pay-the-price.types';
import type { Layout, Scenario, ScenarioLocale } from './scenario.types';

export interface WorkflowWords {
  readonly goal: string;
  readonly thenGoal: string;
  readonly zoomNode: string;
}

export type ScenarioWords = Scenario['i18n'][ScenarioLocale];

export type CountersTest = (move: MoveId, trait: TraitId) => boolean;

export interface WorkflowViewProps {
  readonly scenario: Scenario;
  readonly layout: Layout;
  readonly words: ScenarioWords;
  readonly ui: WorkflowWords;
  readonly step: number;
  readonly counters?: CountersTest;
}
