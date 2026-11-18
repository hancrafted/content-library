import type { ContextPresetId } from './context-data';

declare module '@/shared/lib/explorable-presets' {
  interface ExplorablePresetIds {
    readonly context: ContextPresetId;
  }
}

export {};
