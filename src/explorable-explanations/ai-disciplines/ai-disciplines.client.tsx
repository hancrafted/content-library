'use client';

import type { TargetProps } from '@/shared/lib/context-link.pure';
import { useCallback, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import styles from './ai-disciplines.module.css';
import type { AiDisciplinesPreset, AiDisciplinesWords } from './ai-disciplines.types';
import { DisciplineColumn } from './discipline-column.client';
import { LlmBand } from './llm-band.client';
import { ScaleRowView } from './scale-row-view';
import { DISCIPLINES, type Discipline } from './scene-frames.pure';
import { useScenePlayer } from './scene-player.client';

export interface AiDisciplinesClientProps {
  readonly preset: AiDisciplinesPreset;
  readonly words: AiDisciplinesWords;
  readonly targets?: Partial<Record<Discipline, TargetProps>>;
  readonly markers?: Partial<Record<Discipline, ReactNode>>;
}

const scalesOf = (words: AiDisciplinesWords) =>
  Object.fromEntries(DISCIPLINES.map((each) => [each, words.disciplines[each].scale])) as Record<Discipline, string>;

/** The four columns on one rail, which runs from the first column's centre to the last one's. */
function Rail({ children }: { readonly children: ReactNode }) {
  return (
    <div className="relative">
      <div aria-hidden="true" className={`${styles.rail} absolute inset-x-[12.5%] top-0 hidden md:block`} />
      <ol className={`${styles.columns} grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-4`}>{children}</ol>
    </div>
  );
}

function PlayAll({ label, onPlay }: { readonly label: string; readonly onPlay: () => void }) {
  return (
    <button
      type="button"
      onClick={onPlay}
      className="self-end rounded-full border border-border px-3 py-1 text-caption font-medium text-muted-foreground hover:text-foreground"
    >
      <span aria-hidden="true">▶ </span>
      {label}
    </button>
  );
}

/** The parent's state: the lit discipline, the turned cards, the scene player and the card labels. */
function useTimeline(root: RefObject<HTMLDivElement | null>, preset: AiDisciplinesPreset, words: AiDisciplinesWords) {
  const [hovered, setHovered] = useState<Discipline | null>(null);
  const [flipped, setFlipped] = useState<Partial<Record<Discipline, boolean>>>({});
  const lit = hovered ?? preset.lit;
  const { frames, playAll } = useScenePlayer(root, preset.autoplay, hovered);
  const onFlip = useCallback((each: Discipline) => setFlipped((now) => ({ ...now, [each]: !now[each] })), []);
  const labels = useMemo(
    () => ({ definition: words.definition, flip: words.flip, source: words.source, newTab: words.newTab }),
    [words],
  );
  return { lit, frames, playAll, flipped, onFlip, setHovered, labels };
}

/**
 * The parent of the timeline: it owns the lit discipline (hover or focus, else the Preset's), the turned cards and the
 * scene player, and hands each column its slice. Scale row above, four columns on a rail, the model under them.
 */
export function AiDisciplinesClient({ preset, words, targets, markers }: AiDisciplinesClientProps) {
  const root = useRef<HTMLDivElement>(null);
  const { lit, frames, playAll, flipped, onFlip, setHovered, labels } = useTimeline(root, preset, words);
  return (
    <div ref={root} className="flex flex-col gap-4">
      <ScaleRowView label={words.comparable} scales={scalesOf(words)} lit={lit} />
      <Rail>
        {DISCIPLINES.map((each) => (
          <DisciplineColumn
            key={each}
            discipline={each}
            words={words.disciplines[each]}
            scenes={words.scenes}
            labels={labels}
            frame={frames[each]}
            on={lit === each}
            dimmed={lit !== null && lit !== each}
            flipped={flipped[each] ?? false}
            onLight={setHovered}
            onFlip={onFlip}
            target={targets?.[each]}
            marker={markers?.[each]}
          />
        ))}
      </Rail>
      <LlmBand words={words.llm} labels={labels} />
      <PlayAll label={words.playAll} onPlay={playAll} />
    </div>
  );
}
