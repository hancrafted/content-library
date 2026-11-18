export type Layer = 'thoughtExperiment' | 'freelancer' | 'habits' | 'tryIt';

export const CONTROL_IDS = [
  'scenarioPicker',
  'thoughtExperiment',
  'freelancer',
  'habits',
  'tryIt',
] as const satisfies readonly ('scenarioPicker' | Layer)[];
export type ControlId = (typeof CONTROL_IDS)[number];
export type ControlMap = Readonly<Partial<Record<ControlId, { readonly show?: boolean }>>>;
