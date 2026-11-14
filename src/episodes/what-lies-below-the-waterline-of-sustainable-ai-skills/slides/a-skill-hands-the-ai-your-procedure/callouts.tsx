import { SCENE_HEIGHT, SCENE_WIDTH } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { cn } from '@/shared/lib/utils';
import { LATE_DELAY } from './card-motion';
import styles from './cutaway.module.css';

/** The three things to remember, numbered in the Voice script's order. */
export type CalloutSlug = 'skill' | 'description' | 'project';

/**
 * Each callout's place over the cutaway, in the Scene's units: the foot of its label, where its leader starts. The
 * labels sit in the sky above the cut-open room.
 */
export const CALLOUTS: readonly { readonly slug: CalloutSlug; readonly at: { x: number; y: number } }[] = [
  { slug: 'skill', at: { x: 330, y: 86 } },
  { slug: 'description', at: { x: 540, y: 86 } },
  { slug: 'project', at: { x: 1060, y: 86 } },
];

const PERCENT = 100;

export interface CalloutWords {
  /** The AI term, numbered: `1 · Skill`. */
  readonly term: string;
  /** The scene's word for it: `procedure card`. */
  readonly scene: string;
  /** The number alone, for a Scene too narrow for the label. */
  readonly number: string;
}

/**
 * The three callouts over the cutaway (Spec Option 2a): each names the AI term at body size and the scene's word beneath
 * at caption size, the skill's pill in `primary` as the focal mark, appearing last. Where the Scene is narrow, each
 * shrinks to its number; the tiles below carry the words.
 */
export function Callouts({ words }: { readonly words: Readonly<Record<CalloutSlug, CalloutWords>> }) {
  return CALLOUTS.map(({ slug, at }) => {
    const focal = slug === 'skill';
    const place = { left: `${(at.x / SCENE_WIDTH) * PERCENT}%`, top: `${(at.y / SCENE_HEIGHT) * PERCENT}%` };
    return (
      <p
        key={slug}
        data-callout={slug}
        data-motion={focal ? 'late' : undefined}
        style={focal ? { ...place, ...LATE_DELAY } : place}
        className={cn(
          'absolute flex w-max -translate-x-1/2 -translate-y-full flex-col items-center rounded-xl border-2 px-3 py-1 text-center whitespace-nowrap shadow-md',
          focal
            ? cn(styles.late, 'border-primary bg-primary text-primary-foreground')
            : 'border-foreground bg-card text-card-foreground',
        )}
      >
        <span aria-hidden className="text-caption font-semibold @4xl:hidden">
          {words[slug].number}
        </span>
        <span data-term className="sr-only text-body font-semibold @4xl:not-sr-only">
          {words[slug].term}
        </span>
        <span className={cn('hidden text-caption @4xl:inline', !focal && 'text-muted-foreground')}>
          {words[slug].scene}
        </span>
      </p>
    );
  });
}
