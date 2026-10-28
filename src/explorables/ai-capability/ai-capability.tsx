import { ExploreItLink } from '@/shared/components/core-components/explorable-home/explorable-home.client';
import type { TargetProps } from '@/shared/lib/context-link.pure';
import type { ReactNode } from 'react';
import { aiCapabilityData, mergeWords } from './ai-capability-data';
import { AiCapabilityClient } from './ai-capability.client';
import type { AiCapabilityPresetId, WordsOverride } from './ai-capability.types';
import type { Level } from './scene-frames.pure';

/*
 * The levels timeline, an Explorable: Prompting, Agents, Workflows and the Factory on one language
 * model, each with the scale it compares to, the interface it reaches the model through and a scene that plays it. A
 * Slide names a Preset and may override any word (FE-012); the client parent is the one interactive leaf.
 */

export interface AiCapabilityProps {
  readonly preset: AiCapabilityPresetId;
  /** The URL locale; the German words for `de`, the English ones otherwise. */
  readonly locale: string;
  readonly words?: WordsOverride;
  /** The `data-target` a Speaker note lights, per level column. */
  readonly targets?: Partial<Record<Level, TargetProps>>;
  /** A Slide's context marker, placed on a level's card. */
  readonly markers?: Partial<Record<Level, ReactNode>>;
}

export function AiCapability({ preset, locale, words, targets, markers }: AiCapabilityProps) {
  const data = aiCapabilityData(locale);
  const chosen = data.presets[preset];
  if (chosen === undefined) throw new Error(`ai-capability: unknown Preset "${preset}"`);
  return (
    <>
      <AiCapabilityClient
        preset={chosen}
        words={mergeWords(data.words, words)}
        ceilings={data.ceilings}
        targets={targets}
        markers={markers}
      />
      <ExploreItLink slug="ai-capability" />
    </>
  );
}
