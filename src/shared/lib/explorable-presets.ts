// decision: docs/decision-records/0028-an-event-copy-is-an-instance-of-its-episode.md
export interface ExplorablePresetIds {
  readonly [NO_EXPLORABLE]?: never;
}

declare const NO_EXPLORABLE: unique symbol;

export type ExplorablesDeclaration = { readonly [K in keyof ExplorablePresetIds]?: ExplorablePresetIds[K] };

export type ExplorablePresetsOf<E> = { readonly [K in keyof E & keyof ExplorablePresetIds]: ExplorablePresetIds[K] };
