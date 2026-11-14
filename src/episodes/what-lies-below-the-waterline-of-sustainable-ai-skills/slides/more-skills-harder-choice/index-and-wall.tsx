import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneCard } from '@/episodes/components/slide-shared/iceberg/zone-card';
import { cn } from '@/shared/lib/utils';
import styles from './slide.module.css';

interface ViewWords {
  readonly chat: string;
  readonly coding: string;
}

export interface IndexCard {
  /** The skill's folder name, the card's name in the Coding agent view; code, not translated. */
  readonly folder: string;
  readonly name: string;
  readonly twin: boolean;
}

function Pill({ words, tone }: { readonly words: ViewWords; readonly tone: 'primary' | 'card' }) {
  return (
    <p
      className={cn(
        'w-fit rounded-full px-3 py-1 text-caption font-semibold',
        tone === 'primary' ? 'bg-primary text-primary-foreground' : 'bg-card text-card-foreground',
      )}
    >
      <InView view="chat">{words.chat}</InView>
      <InView view="coding" className="font-mono">
        {words.coding}
      </InView>
    </p>
  );
}

/** One card of the board: a near-twin dashed and faded back, the led card ringed in primary. */
function BoardCard({ card: { folder, name, twin }, led }: { readonly card: IndexCard; readonly led: boolean }) {
  return (
    <li
      data-card={folder}
      data-twin={twin ? '' : undefined}
      data-led={led ? '' : undefined}
      className={cn(
        'flex min-h-11 items-center rounded-md bg-card px-3 py-2 text-caption text-card-foreground',
        twin && cn('border-2 border-dashed border-muted-foreground', styles.twin),
        led && 'font-semibold ring-3 ring-primary',
      )}
    >
      <InView view="chat">{name}</InView>
      <InView view="coding" className="font-mono break-all">
        {folder}
      </InView>
    </li>
  );
}

export interface SkillIndexBoardProps {
  readonly label: ViewWords;
  readonly cards: readonly IndexCard[];
  /** The folder of the one card the wall list leads to. */
  readonly target: string;
  readonly className?: string;
}

/**
 * The skill index board over the console: eight cards, the four near-twins dashed and faded back, the one card the wall
 * list leads to ringed in primary. In the Coding agent view each card shows its skill folder.
 */
export function SkillIndexBoard({ label, cards, target, className }: SkillIndexBoardProps) {
  return (
    <div className={cn('relative flex flex-col gap-2', className)}>
      <Pill words={label} tone="card" />
      <ul className="grid grid-cols-2 gap-2 rounded-xl bg-foreground/80 p-2 shadow-md">
        {cards.map((card) => (
          <BoardCard key={card.folder} card={card} led={card.folder === target} />
        ))}
      </ul>
    </div>
  );
}

/** One line of the wall's list, numbered in the Chat app view, a Markdown list item in the Coding agent view. */
function WallItem({ folder, name, n, lit }: { folder: string; name: string; n: number; lit: boolean }) {
  return (
    <li
      data-wall-item={folder}
      data-lit={lit ? '' : undefined}
      className={cn('rounded-lg px-3 py-1.5 text-body', lit && cn('font-semibold', styles.lit))}
    >
      <InView view="chat">
        {n} {name}
      </InView>
      <InView view="coding" className="font-mono">
        - {folder}
      </InView>
    </li>
  );
}

export interface WallBriefProps {
  readonly chat: { readonly title: string; readonly lead: string };
  readonly coding: { readonly title: string; readonly heading: string; readonly lead: string };
  readonly items: readonly { readonly folder: string; readonly name: string }[];
  readonly lit: string;
  readonly pill: ViewWords;
  readonly className?: string;
}

/**
 * The project brief on the wall, the project instructions, always loaded: a short list of three skills, its first line
 * lit. In the Coding agent view it is `AGENTS.md` with a `## Skills` list.
 */
export function WallBrief({ chat, coding, items, lit, pill, className }: WallBriefProps) {
  return (
    <div className={cn('relative flex flex-col gap-2', className)}>
      <ZoneCard className="flex flex-col gap-3 rounded-xl p-4 shadow-md">
        <InView view="chat" as="div" className="flex flex-col gap-1">
          <span className="text-body font-semibold">{chat.title}</span>
          <span className="text-caption">{chat.lead}</span>
        </InView>
        <InView view="coding" as="div" className="flex flex-col gap-1 font-mono">
          <span className="text-body font-semibold">{coding.title}</span>
          <span className="text-caption">{coding.heading}</span>
          <span className="text-caption">{coding.lead}</span>
        </InView>
        <ol className="flex flex-col gap-1">
          {items.map(({ folder, name }, index) => (
            <WallItem key={folder} folder={folder} name={name} n={index + 1} lit={folder === lit} />
          ))}
        </ol>
      </ZoneCard>
      <Pill words={pill} tone="primary" />
    </div>
  );
}
