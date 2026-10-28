import { ExploreItLink } from '@/shared/components/core-components/explorable-home/explorable-home.client';
import type { TargetProps } from '@/shared/lib/context-link.pure';
import type { ReactNode } from 'react';
import { aiDisciplinesData, mergeWords } from './ai-disciplines-data';
import { AiDisciplinesClient } from './ai-disciplines.client';
import type { AiDisciplinesPresetId, WordsOverride } from './ai-disciplines.types';
import type { Discipline } from './scene-frames.pure';

/*
 * The disciplines timeline, an Explorable explanation: Prompting, Agents, Workflows and the Factory on one language
 * model, each with the scale it compares to, the interface it reaches the model through and a scene that plays it. A
 * Slide names a Preset and may override any word (FE-012); the client parent is the one interactive leaf.
 */

export interface AiDisciplinesProps {
  readonly preset: AiDisciplinesPresetId;
  /** The URL locale; the German words for `de`, the English ones otherwise. */
  readonly locale: string;
  readonly words?: WordsOverride;
  /** The `data-target` a Speaker note lights, per discipline column. */
  readonly targets?: Partial<Record<Discipline, TargetProps>>;
  /** A Slide's context marker, placed on a discipline's card. */
  readonly markers?: Partial<Record<Discipline, ReactNode>>;
}

export function AiDisciplines({ preset, locale, words, targets, markers }: AiDisciplinesProps) {
  const data = aiDisciplinesData(locale);
  const chosen = data.presets[preset];
  if (chosen === undefined) throw new Error(`ai-disciplines: unknown Preset "${preset}"`);
  return (
    <>
      <AiDisciplinesClient preset={chosen} words={mergeWords(data.words, words)} targets={targets} markers={markers} />
      <ExploreItLink slug="ai-disciplines" />
    </>
  );
}
