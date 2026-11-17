import { ExploreItLink } from '@/shared/components/core-components/explorable-home/explorable-home.client';
import type { TargetProps } from '@/shared/lib/context-link.pure';
import type { ReactNode } from 'react';
import { aiCapabilityData, mergeWords } from './ai-capability-data';
import { AiCapabilityClient } from './ai-capability.client';
import type { AiCapabilityPresetId, LayerRow, WordsOverride } from './ai-capability.types';
import type { Level } from './scene-frames.pure';

// decision: FE-012 §2
export interface AiCapabilityProps {
  readonly preset: AiCapabilityPresetId;
  readonly locale: string;
  readonly words?: WordsOverride;
  readonly targets?: Partial<Record<Level, TargetProps>>;
  readonly rowTargets?: Partial<Record<LayerRow, TargetProps>>;
  readonly markers?: Partial<Record<Level, ReactNode>>;
  readonly sourceMarkers?: Partial<Record<Level, ReactNode>>;
}

export function AiCapability(props: AiCapabilityProps) {
  const { preset, locale, words, targets, rowTargets, markers, sourceMarkers } = props;
  const data = aiCapabilityData(locale);
  const chosen = data.presets[preset];
  if (chosen === undefined) throw new Error(`ai-capability: unknown Preset "${preset}"`);
  return (
    <>
      <AiCapabilityClient
        preset={chosen}
        words={mergeWords(data.words, words)}
        productivity={data.productivity}
        layers={data.layers}
        targets={targets}
        rowTargets={rowTargets}
        markers={markers}
        sourceMarkers={sourceMarkers}
      />
      <ExploreItLink slug="ai-capability" />
    </>
  );
}
