import { ChevronRight } from 'lucide-react';
import { plainText } from './context-format.pure';
import { actOf, catLabel, cliLines, fill, k, outOf, stepCat, storyOf, type Say } from './context-view';
import styles from './context.module.css';
import type { Step } from './context.types';
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
export function textOf(say: Say, step: Step): string {
  if (step.kind === 'you' || step.kind === 'ai') return step.text;
  const story = storyOf(say, step);
  return (say.tech ? story.labelTechnical : undefined) ?? story.label ?? story.event;
}

/** A bubble's accessible name: its category and its text. */
export const bubbleName = (say: Say, step: Step): string =>
  fill(say.words.bubbleLabel, { category: catLabel(say, stepCat(step)), text: plainText(textOf(say, step)) });

/** A step's name in the panel's lists: a chip's first label part, a message with its category. */
export function nameOf(say: Say, step: Step): string {
  if (roleOf(step) !== 'chip') return bubbleName(say, step);
  return plainText(textOf(say, step)).split(' · ')[0] ?? '';
}

function ToolCard({ say, step }: { readonly say: Say; readonly step: Step }) {
  const story = storyOf(say, step);
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
        <span className={styles.tout}>⎿&nbsp; {outOf(say, step)}</span>
      </span>
    </span>
  );
}

function SimpleBody({ say, step }: { readonly say: Say; readonly step: Step }) {
  if (roleOf(step) !== 'chip') return <Rich text={textOf(say, step)} />;
  return (
    <>
      <span className={styles.act}>
        <Rich text={actOf(say, step)} />
        <ChevronRight aria-hidden="true" />
      </span>
      <ToolCard say={say} step={step} />
    </>
  );
}

function TerminalTool({ say, step }: { readonly say: Say; readonly step: Extract<Step, { kind: 'tool' }> }) {
  return (
    <>
      {cliLines(step).map((line, i) => (
        <span key={i} className={styles.tline}>
          <span className={`${styles.tp} ${styles.tpTool}`}>⏺</span>
          {line}
        </span>
      ))}
      <span className={styles.tout}>⎿&nbsp; {outOf(say, step)}</span>
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
function systemLine(say: Say, step: Step): string {
  if (step.kind === 'compact') return fill(say.words.compacted, { tokens: k(say, step.blocks[0]?.tokens ?? 0) });
  if (step.kind === 'cleared') return fill(say.words.cleared, { tokens: k(say, step.cleared) });
  return textOf(say, step);
}

function TechnicalBody({ say, step }: { readonly say: Say; readonly step: Step }) {
  if (step.kind === 'tool') return <TerminalTool say={say} step={step} />;
  const prompt = PROMPTS[step.kind];
  if (!prompt) {
    const story = storyOf(say, step);
    return <span className={styles.tdim}># {plainText(story.term ?? story.labelTechnical ?? story.event)}</span>;
  }
  return (
    <>
      <span className={prompt.ai ? `${styles.tp} ${styles.tpAi}` : styles.tp}>{prompt.glyph}</span>
      <Rich text={systemLine(say, step)} />
    </>
  );
}

/** One bubble's content at the view's depth. */
export function BubbleBody({ say, step }: { readonly say: Say; readonly step: Step }) {
  return say.tech ? <TechnicalBody say={say} step={step} /> : <SimpleBody say={say} step={step} />;
}
