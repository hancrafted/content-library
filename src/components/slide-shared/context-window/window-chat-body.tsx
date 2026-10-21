import { ChevronRight } from 'lucide-react';
import { plainText } from './context-format.pure';
import { actOf, catLabel, cliLines, fill, k, outOf, stepCat, storyOf, type View } from './context-view';
import styles from './context-window.module.css';
import type { Step } from './context-window.types';
import { Rich } from './window-bits';

/* What one bubble says: a messenger message in Simple, a line of a Claude Code session in Technical. */

export type Role = 'you' | 'ai' | 'chip' | 'compact' | 'cleared';

const ROLE: Readonly<Record<Step['kind'], Role>> = {
  start: 'chip',
  memory: 'chip',
  tool: 'chip',
  you: 'you',
  ai: 'ai',
  compact: 'compact',
  cleared: 'cleared',
};

export const roleOf = (step: Step): Role => ROLE[step.kind];

/** The words a step shows as its own text: the message, or the story's label for a chip. */
export function textOf(v: View, step: Step): string {
  if (step.kind === 'you' || step.kind === 'ai') return step.text;
  const story = storyOf(v, step);
  return (v.tech ? story.labelTechnical : undefined) ?? story.label ?? story.event;
}

/** A bubble's accessible name: its category and its text. */
export const bubbleName = (v: View, step: Step): string =>
  fill(v.words.bubbleLabel, { category: catLabel(v, stepCat(step)), text: plainText(textOf(v, step)) });

/** A step's name in the panel's lists: a chip's first label part, a message with its category. */
export function nameOf(v: View, step: Step): string {
  if (roleOf(step) !== 'chip') return bubbleName(v, step);
  return plainText(textOf(v, step)).split(' · ')[0] ?? '';
}

function ToolCard({ v, step }: { readonly v: View; readonly step: Step }) {
  const story = storyOf(v, step);
  if (step.kind !== 'tool')
    return (
      <span className={styles.tool}>
        <span className={styles.toolDesc}>
          <Rich text={story.labelTechnical ?? story.label ?? story.event} />
        </span>
      </span>
    );
  return (
    <span className={styles.tool}>
      <span className={styles.toolDesc}>
        <Rich text={story.label ?? story.event} />
      </span>
      <span className={`${styles.toolCode} font-mono`}>
        {cliLines(step).map((line, i) => (
          <span key={i} className={styles.tline}>
            {line}
          </span>
        ))}
        <span className={styles.tout}>⎿&nbsp; {outOf(v, step)}</span>
      </span>
    </span>
  );
}

function SimpleBody({ v, step }: { readonly v: View; readonly step: Step }) {
  if (roleOf(step) !== 'chip') return <Rich text={textOf(v, step)} />;
  return (
    <>
      <span className={styles.act}>
        <Rich text={actOf(v, step)} />
        <ChevronRight aria-hidden="true" />
      </span>
      <ToolCard v={v} step={step} />
    </>
  );
}

function TerminalTool({ v, step }: { readonly v: View; readonly step: Extract<Step, { kind: 'tool' }> }) {
  return (
    <>
      {cliLines(step).map((line, i) => (
        <span key={i} className={styles.tline}>
          <span className={`${styles.tp} ${styles.tpTool}`}>⏺</span>
          {line}
        </span>
      ))}
      <span className={styles.tout}>⎿&nbsp; {outOf(v, step)}</span>
    </>
  );
}

const PROMPTS: Partial<Record<Step['kind'], { readonly glyph: string; readonly ai: boolean }>> = {
  you: { glyph: '>', ai: false },
  ai: { glyph: '⏺', ai: true },
  compact: { glyph: '✻', ai: false },
  cleared: { glyph: '✻', ai: false },
};

/** The line a compaction or a clearing prints, sized. */
function systemLine(v: View, step: Step): string {
  if (step.kind === 'compact') return fill(v.words.compacted, { tokens: k(v, step.blocks[0]?.tokens ?? 0) });
  if (step.kind === 'cleared') return fill(v.words.cleared, { tokens: k(v, step.cleared) });
  return textOf(v, step);
}

function TechnicalBody({ v, step }: { readonly v: View; readonly step: Step }) {
  if (step.kind === 'tool') return <TerminalTool v={v} step={step} />;
  const prompt = PROMPTS[step.kind];
  if (!prompt) {
    const story = storyOf(v, step);
    return <span className={styles.tdim}># {plainText(story.term ?? story.labelTechnical ?? story.event)}</span>;
  }
  return (
    <>
      <span className={prompt.ai ? `${styles.tp} ${styles.tpAi}` : styles.tp}>{prompt.glyph}</span>
      <Rich text={systemLine(v, step)} />
    </>
  );
}

/** One bubble's content at the view's depth. */
export function BubbleBody({ v, step }: { readonly v: View; readonly step: Step }) {
  return v.tech ? <TechnicalBody v={v} step={step} /> : <SimpleBody v={v} step={step} />;
}
