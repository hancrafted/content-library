import { DEFINITION_IDS, LEVEL_IDS, PRESET_IDS } from './brief-or-pay-the-price.types';
import { controlProblems } from './controls.pure';
import { LAYERS_OF } from './layer-state.pure';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const VIEW_IDS = [...DEFINITION_IDS, 'stages'] as const;

const oneOf = (value: unknown, allowed: readonly string[]): boolean => allowed.includes(String(value));

function layerProblems(preset: Record<string, unknown>, at: string): string[] {
  if (!Array.isArray(preset.layers)) return [`${at}: layers is a list of toggles`];
  const offered: readonly string[] =
    oneOf(preset.level, LEVEL_IDS) && preset.level !== 'define' ? LAYERS_OF[preset.level as 'agent' | 'workflow'] : [];
  return preset.layers
    .filter((layer) => !offered.includes(String(layer)))
    .map((layer) => `${at}: toggle "${String(layer)}" is not offered at the ${String(preset.level)} level`);
}

function onePresetProblems(preset: unknown, at: string): string[] {
  if (!isRecord(preset)) return [`${at}: needs view, level, scenario, controls and layers`];
  return [
    ...(oneOf(preset.view, VIEW_IDS)
      ? []
      : [`${at}: view "${String(preset.view)}" is not one of ${VIEW_IDS.join(', ')}`]),
    ...(oneOf(preset.level, LEVEL_IDS)
      ? []
      : [`${at}: level "${String(preset.level)}" is not one of ${LEVEL_IDS.join(', ')}`]),
    ...(typeof preset.scenario === 'string' && preset.scenario !== '' ? [] : [`${at}: scenario names a Scenario file`]),
    ...controlProblems(preset.controls, at),
    ...layerProblems(preset, at),
  ];
}

export function presetsProblems(presets: unknown): string[] {
  if (!isRecord(presets)) return ['presets: missing'];
  const ids = Object.keys(presets);
  return [
    ...ids.filter((id) => !oneOf(id, PRESET_IDS)).map((id) => `presets.${id}: not a Preset of this Explorable`),
    ...PRESET_IDS.flatMap((id) =>
      ids.includes(id) ? onePresetProblems(presets[id], `presets.${id}`) : [`presets.${id}: missing`],
    ),
  ];
}
