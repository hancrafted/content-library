import type { AiCapabilityPresetId } from './ai-capability.types';

declare module '@/episodes/lib/explorable-presets' {
  interface ExplorablePresetIds {
    readonly aiCapability: AiCapabilityPresetId;
  }
}

export {};
