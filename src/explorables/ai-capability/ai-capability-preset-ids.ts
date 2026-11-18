import type { AiCapabilityPresetId } from './ai-capability.types';

declare module '@/shared/lib/explorable-presets' {
  interface ExplorablePresetIds {
    readonly aiCapability: AiCapabilityPresetId;
  }
}

export {};
