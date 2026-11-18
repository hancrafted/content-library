import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/lib/locale.pure';
import configSource from './brief-or-pay-the-price.config.yml';
import {
  DEFINITION_IDS,
  MOVE_IDS,
  PRESET_IDS,
  type Definition,
  type Config,
  type DefinitionId,
  type MoveId,
  type PresetId,
  type Preset,
  type RowWords,
  type Words,
  type WordsOverride,
} from './brief-or-pay-the-price.types';
import { CONFIG_FILE, mergeWords, parseConfig } from './config.pure';
import type { Counters } from './matrix-data.pure';
import type { Scenario, WorkflowScenario } from './scenario.types';
import { allScenarios } from './scenarios';

export interface ExplorableData {
  readonly locale: Locale;
  readonly words: Words;
  readonly definitions: Readonly<Record<DefinitionId, Definition>>;
  readonly stages: Readonly<Record<string, Definition>>;
  readonly scenarios: Readonly<Record<string, WorkflowScenario>>;
  readonly matrix: MatrixData;
  readonly presets: Readonly<Record<PresetId, Preset>>;
}

export interface MatrixData {
  readonly counters: Counters;
  readonly sources: Readonly<Record<MoveId, string>>;
}

const STAGE_BEAT_MILLISECONDS = 2600;

const config = parseConfig(configSource);

function rowWords(words: Words, id: DefinitionId, row: string): RowWords {
  const found = words.definitions[id].rows[row];
  if (found === undefined) throw new Error(`${CONFIG_FILE}: no words for ${id} row ${row}`);
  return found;
}

const NO_WORDS = { name: '', short: '', analogy: '', ai: '' };

function stageRow(scenario: Scenario, locale: Locale, index: number): Definition['rows'][number] {
  const stage = scenario.stages[index] as Scenario['stages'][number];
  const said = scenario.i18n[locale].stages[stage.id] ?? NO_WORDS;
  return {
    id: stage.id,
    scene: stage.scene,
    letter: scenario.acronym?.[index] ?? String(index + 1),
    beatMilliseconds: STAGE_BEAT_MILLISECONDS,
    words: {
      name: said.name,
      gloss: '',
      short: said.short,
      freelancer: said.analogy,
      ai: said.ai,
    },
  };
}

function stagesOf(scenario: Scenario, words: Words, locale: Locale): Definition {
  const { stages } = words;
  return {
    id: 'stages',
    acronym: scenario.acronym ?? stages.tab,
    wipe: false,
    words: {
      title: scenario.i18n[locale].title,
      heads: {
        ...stages.heads,
        middle: `${scenario.stages.length} ${stages.heads.middle}`,
      },
      close: stages.close,
      rows: {},
    },
    rows: scenario.stages.map((_, index) => stageRow(scenario, locale, index)),
  };
}

function checkPresetScenarios(presets: Config['presets'], scenarios: Readonly<Record<string, unknown>>): void {
  for (const id of PRESET_IDS) {
    const { scenario } = presets[id];
    if (scenarios[scenario] === undefined)
      throw new Error(`${CONFIG_FILE}: presets.${id}: scenario "${scenario}" is not a Scenario file`);
  }
}

export function explorableData(locale: string, override?: WordsOverride): ExplorableData {
  const chosen = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const words = mergeWords(config.i18n[chosen], override);
  const definitionOf = (id: DefinitionId): Definition => ({
    id,
    acronym: config.definitions[id].acronym,
    wipe: config.definitions[id].wipe === true,
    words: words.definitions[id],
    rows: config.definitions[id].rows.map((row) => ({
      ...row,
      scene: row.id,
      words: rowWords(words, id, row.id),
    })),
  });
  const definitions = Object.fromEntries(DEFINITION_IDS.map((id) => [id, definitionOf(id)])) as Record<
    DefinitionId,
    Definition
  >;
  const stages = Object.fromEntries(allScenarios().map((scenario) => [scenario.id, stagesOf(scenario, words, chosen)]));
  const scenarios = Object.fromEntries(
    allScenarios().map(({ i18n, ...scenario }) => [scenario.id, { scenario, words: i18n[chosen] }]),
  );
  const matrix: MatrixData = {
    counters: Object.fromEntries(MOVE_IDS.map((id) => [id, config.matrix[id].counters])) as Counters,
    sources: Object.fromEntries(MOVE_IDS.map((id) => [id, config.matrix[id].source])) as Record<MoveId, string>,
  };
  checkPresetScenarios(config.presets, scenarios);
  return { locale: chosen, words, definitions, stages, scenarios, matrix, presets: config.presets };
}
