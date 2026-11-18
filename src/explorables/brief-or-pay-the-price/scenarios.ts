import { loadScenario } from './scenario.pure';
import type { Scenario } from './scenario.types';
import drive from './scenarios/drive.yml';

const SOURCES = { drive } as const satisfies Record<string, string>;

export type ScenarioId = keyof typeof SOURCES;

export const SCENARIO_IDS = Object.keys(SOURCES) as ScenarioId[];

function loadShipped(): Readonly<Record<ScenarioId, Scenario>> {
  const loaded = {} as Record<ScenarioId, Scenario>;
  const problems: string[] = [];
  for (const id of SCENARIO_IDS) {
    const result = loadScenario(`scenarios/${id}.yml`, SOURCES[id]);
    if ('problems' in result) problems.push(...result.problems);
    else if (result.scenario.id !== id)
      problems.push(`scenarios/${id}.yml: id: "${result.scenario.id}" must match the file name`);
    else loaded[id] = result.scenario;
  }
  if (problems.length > 0) throw new Error(`Scenarios:\n${problems.join('\n')}`);
  return loaded;
}

const SCENARIOS = loadShipped();

export const scenarioFor = (id: ScenarioId): Scenario => SCENARIOS[id];

export const allScenarios = (): readonly Scenario[] => SCENARIO_IDS.map(scenarioFor);
