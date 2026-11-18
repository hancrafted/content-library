import type { ContextPresetId } from './context-data';

declare module '@/episodes/lib/explorable-presets' {
  interface ExplorablePresetIds {
    readonly context: ContextPresetId;
  }
}

export {};
