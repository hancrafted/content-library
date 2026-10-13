import { cn } from '@/lib/utils';
import styles from './the-work-relocates.module.css';

export interface EffortSegment {
  slug: string;
  label: string;
  tone: 'typing' | 'human' | 'ai';
  weight: number;
}

// Strings joined, not merged: the human cap sets every side's colour and the separator then sets the right one.
const TONE = {
  typing: 'bg-muted border border-border',
  human: 'bg-human/20 border-t-2 border-human border-r border-r-background last:border-r-0',
  ai: 'bg-ai border-r border-background last:border-r-0',
} as const;

const SWATCH = {
  typing: 'bg-muted border border-border',
  human: 'bg-human/20 border-t-2 border-human',
  ai: 'bg-ai',
} as const;

type Segments = readonly EffortSegment[];

// The bar itself: a fixed-width row whose segments share it by weight. An animated bar leads with a hidden typing
// segment, at rest 0, that the module shrinks from bar 1's weight (9) while the others grow into its place.
function Row({ segments, animated }: { segments: Segments; animated: boolean }) {
  return (
    <div data-bar className="flex h-12 w-full overflow-hidden rounded-md">
      {animated && (
        <span
          aria-hidden
          data-segment="typing"
          style={{ flexGrow: 0 }}
          className={cn('min-w-0 bg-muted', styles.shrink)}
        />
      )}
      {segments.map(({ slug, tone, weight }) => (
        <span
          key={slug}
          data-segment={slug}
          style={{ flexGrow: weight }}
          className={cn('min-w-0', TONE[tone], animated && styles.grow)}
        />
      ))}
    </div>
  );
}

// The labels on the bar's own weights, each with a 1px tick, so each sits under its segment.
function Labels({ segments, className }: { segments: Segments; className: string }) {
  return (
    <div className={cn('w-full', className)}>
      {segments.map(({ slug, label, weight }) => (
        <span
          key={slug}
          style={{ flexGrow: weight }}
          className="min-w-0 basis-0 border-l border-border pl-2 text-caption text-muted-foreground"
        >
          {label}
        </span>
      ))}
    </div>
  );
}

// Below md: the labels as a vertical key, a swatch beside each.
function Key({ segments }: { segments: Segments }) {
  return (
    <ul className="flex flex-col gap-1 md:hidden">
      {segments.map(({ slug, label, tone }) => (
        <li key={slug} className="flex items-center gap-2 text-caption text-muted-foreground">
          <span aria-hidden className={cn('size-3 rounded-sm', SWATCH[tone])} />
          {label}
        </li>
      ))}
    </ul>
  );
}

/**
 * One bar of a single task's effort: segments share a fixed-width row by `weight` (flex-grow), so two bars at the
 * same width show the same total. Labels sit under the bar, never inside a segment; from md up they share the bar's
 * weights, below md a bar of several segments lists them as a key. `animated` adds the hidden typing segment.
 */
export function EffortBar({
  segments,
  animated = false,
  className,
  ...rest
}: {
  segments: Segments;
  animated?: boolean;
  className?: string;
  'data-target'?: string;
}) {
  const several = segments.length > 1;
  return (
    <div {...rest} className={cn('flex flex-col gap-2', className)}>
      <Row segments={segments} animated={animated} />
      <Labels segments={segments} className={several ? 'hidden md:flex' : 'flex'} />
      {several && <Key segments={segments} />}
    </div>
  );
}
