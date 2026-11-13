import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneCard } from '@/episodes/components/slide-shared/iceberg/zone-card';
import { cn } from '@/shared/lib/utils';
import styles from './slide.module.css';

export interface IndexEntry {
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly vague: boolean;
  readonly focal: boolean;
}

interface ViewWords {
  readonly chat: string;
  readonly coding: string;
}

export interface ManualIndexProps {
  readonly heading: string;
  readonly headingNote: string;
  readonly headingCoding: string;
  readonly loaded: ViewWords;
  readonly closed: ViewWords;
  readonly entries: readonly IndexEntry[];
  readonly className?: string;
}

function Pill({ words, tone }: { readonly words: ViewWords; readonly tone: 'primary' | 'muted' }) {
  const look =
    tone === 'primary'
      ? 'bg-primary text-primary-foreground'
      : 'border border-border bg-background text-muted-foreground';
  return (
    <p className={cn('w-fit rounded-full px-3 py-1 text-caption font-semibold', look)}>
      <InView view="chat">{words.chat}</InView>
      <InView view="coding" className="font-mono">
        {words.coding}
      </InView>
    </p>
  );
}

/** One index row: the skill's name over its description, or its `name:` line in the Coding agent view. */
function IndexRow({ entry: { slug, name, description, vague, focal } }: { readonly entry: IndexEntry }) {
  return (
    <li
      data-index-row={slug}
      data-vague={vague ? '' : undefined}
      data-focal={focal ? '' : undefined}
      className={cn('flex flex-col rounded-lg px-3 py-2', focal && styles.lit)}
    >
      <InView view="chat" className="text-body font-semibold">
        {name}
      </InView>
      <InView view="coding" className="font-mono text-caption font-semibold">
        name: {slug}
      </InView>
      <span className={cn('text-caption', !focal && 'text-muted-foreground')}>{description}</span>
    </li>
  );
}

/**
 * The manual's index in close-up, the one page the pilot can read: each skill a name over its one-line description, the
 * clear entry lit as the task arrives. Real text on the card, so it reads at any width; in the Coding agent view each
 * name becomes the `name:` line of its `SKILL.md`.
 */
export function ManualIndex(props: ManualIndexProps) {
  const { heading, headingNote, headingCoding, loaded, closed, entries, className } = props;
  return (
    <div className={cn('relative flex flex-col gap-2', className)}>
      <Pill words={loaded} tone="primary" />
      <ZoneCard className="rounded-xl p-4 shadow-md">
        <p className="border-b border-border pb-2 text-body font-semibold">
          <InView view="chat">
            {heading} <span className="text-caption font-normal text-muted-foreground">· {headingNote}</span>
          </InView>
          <InView view="coding" className="font-mono text-caption">
            {headingCoding}
          </InView>
        </p>
        <ul className="mt-2 flex flex-col gap-1">
          {entries.map((entry) => (
            <IndexRow key={entry.slug} entry={entry} />
          ))}
        </ul>
      </ZoneCard>
      <Pill words={closed} tone="muted" />
    </div>
  );
}
