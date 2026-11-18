import { parse } from 'yaml';
import { scenarioProblems } from './scenario-check.pure';
import { layoutScenario } from './scenario-layout.pure';
import type { ScenarioFile, ScenarioResult } from './scenario.types';

export function loadScenario(file: string, source: string): ScenarioResult {
  let data: unknown;
  try {
    data = parse(source);
  } catch (error) {
    return {
      problems: [`${file}: YAML: ${error instanceof Error ? error.message : String(error)}`],
    };
  }
  const problems = scenarioProblems(data).map((problem) => `${file}: ${problem}`);
  if (problems.length > 0) return { problems };
  const checked = data as ScenarioFile;
  const layouts = {
    horizontal: layoutScenario(checked, 'horizontal'),
    vertical: layoutScenario(checked, 'vertical'),
  };
  return { scenario: { ...checked, file, layouts } };
}
