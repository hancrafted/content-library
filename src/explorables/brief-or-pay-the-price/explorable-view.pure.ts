import {
  DEFINITION_IDS,
  type Definition,
  type DefinitionId,
  type MirrorRow,
  type ViewId,
  type Words,
} from './brief-or-pay-the-price.types';
import type { ExplorableState } from './explorable-state.pure';
import { plain } from './matrix-data.pure';

export interface ViewData {
  readonly words: Words;
  readonly definitions: Readonly<Record<DefinitionId, Definition>>;
  readonly stages: Readonly<Record<string, Definition>>;
}

export const rowCounts = ({ definitions, stages }: Pick<ViewData, 'definitions' | 'stages'>) => ({
  ...Object.fromEntries(DEFINITION_IDS.map((id) => [id, definitions[id].rows.length])),
  ...Object.fromEntries(Object.entries(stages).map(([id, each]) => [`stages:${id}`, each.rows.length])),
});

export const definitionOf = (
  { definitions, stages }: Pick<ViewData, 'definitions' | 'stages'>,
  state: Pick<ExplorableState, 'view' | 'scenario'>,
): Definition => (state.view === 'stages' ? (stages[state.scenario] as Definition) : definitions[state.view]);

export const rowOf = (definition: Definition, id: string): MirrorRow =>
  definition.rows.find((row) => row.id === id) as MirrorRow;

export function beatsOf(
  data: Pick<ViewData, 'definitions' | 'stages'>,
  state: Pick<ExplorableState, 'view' | 'scenario' | 'cell'>,
): readonly number[] {
  const { cell } = state;
  if (cell === null) return definitionOf(data, state).rows.map((row) => row.beatMilliseconds);
  return [
    rowOf(data.definitions.price, cell.trait).beatMilliseconds,
    rowOf(data.definitions.brief, cell.move).beatMilliseconds,
  ];
}

export function titleOf(
  { words, definitions }: Pick<ViewData, 'words' | 'definitions'>,
  tabs: Readonly<Record<ViewId, Definition>>,
  state: Pick<ExplorableState, 'view' | 'level' | 'cell'>,
): string {
  const { cell } = state;
  if (state.level === 'define') return tabs[state.view].words.title;
  if (state.level === 'workflow') return tabs.stages.words.title;
  if (cell === null) return words.matrix.title;
  const names = {
    move: rowOf(definitions.brief, cell.move).words.name,
    trait: rowOf(definitions.price, cell.trait).words.name,
  };
  return plain(words.matrix.cellTitle, names);
}
