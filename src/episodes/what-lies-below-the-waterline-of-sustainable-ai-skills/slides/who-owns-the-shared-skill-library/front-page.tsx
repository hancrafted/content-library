import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneCard } from '@/episodes/components/slide-shared/iceberg/zone-card';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import styles from './slide.module.css';

export interface FrontRow {
  readonly slug: string;
  readonly term: string;
  /** The Context marker after the term. */
  readonly marker: ReactNode;
  /** The term in the story, under it in the Chat app view: "fleet, ship or project". */
  readonly scene?: string;
  readonly chat: ReactNode;
  readonly coding: ReactNode;
  /** A note's target, when one names the row. */
  readonly target?: { readonly 'data-target': string };
}

export interface FrontPageProps {
  readonly label: string;
  readonly scope: string;
  readonly title: string;
  readonly rows: readonly FrontRow[];
  /** The `SKILL.md` inset of the Coding agent view: its heading with marker, front matter and note. */
  readonly inset: { readonly heading: ReactNode; readonly lines: readonly string[]; readonly note: string };
  /** The dark corner's label, with its marker. */
  readonly darkCorner: ReactNode;
  readonly className?: string;
}

/** One line of the page: its AI term with marker, the story word under it, and the view's text. */
function Row({ slug, term, marker, scene, chat, coding, target }: FrontRow) {
  return (
    <li
      {...target}
      data-front-row={slug}
      className="focus-group__item flex flex-col gap-0.5 border-t border-border py-2 first:border-t-0"
    >
      <p className="flex items-center gap-1 text-body font-semibold">
        <span data-term>{term}</span>
        {marker}
      </p>
      {scene === undefined ? null : (
        <InView view="chat" as="p" className="text-caption text-muted-foreground">
          {scene}
        </InView>
      )}
      <InView view="chat" as="p" className="text-caption text-muted-foreground">
        {chat}
      </InView>
      <InView view="coding" as="p" className="text-caption text-muted-foreground">
        {coding}
      </InView>
    </li>
  );
}

/** The `SKILL.md` inset of the Coding agent view: its `metadata` map by convention. */
function MetadataInset({ heading, lines, note }: FrontPageProps['inset']) {
  return (
    <InView view="coding" as="div" className="flex flex-col gap-1 rounded-md bg-card-foreground p-3 text-card">
      <p className="flex items-center gap-1 text-caption font-semibold">{heading}</p>
      <code translate="no" className="block font-mono text-caption whitespace-pre-wrap">
        {lines.join('\n')}
      </code>
      <p className="text-caption opacity-80">{note}</p>
    </InView>
  );
}

/** The page's lower corner, left dark for the questions nobody has settled. */
function DarkCorner({ children }: { readonly children: ReactNode }) {
  return (
    <div
      data-dark-corner
      className={cn(styles.corner, 'absolute right-0 bottom-0 flex h-28 w-[70%] items-end justify-end p-3')}
    >
      <p className="flex max-w-48 items-end gap-1 text-right text-caption italic">{children}</p>
    </div>
  );
}

/**
 * The shared skill library's front page, drawn as the fleet manual open on its binder rings: what a skill needs beyond
 * owner and version, each line led by its AI term, and the lower corner left dark for what nobody has settled. Hover
 * dims the other lines.
 */
export function FrontPage({ label, scope, title, rows, inset, darkCorner, className }: FrontPageProps) {
  return (
    <div data-motion="zoom" className={cn(styles.page, 'rounded-xl p-2 shadow-md', className)}>
      <ZoneCard className="relative flex flex-col gap-3 overflow-hidden rounded-lg p-4 pb-28">
        <p className="flex flex-wrap items-center justify-between gap-2 text-caption text-muted-foreground">
          {label}
          <span className="rounded-full bg-card-foreground px-3 py-0.5 font-semibold text-card">{scope}</span>
        </p>
        <p className="text-body font-semibold">{title}</p>
        <ol className="focus-group focus-group--dim-others flex flex-col">
          {rows.map((row) => (
            <Row key={row.slug} {...row} />
          ))}
        </ol>
        <MetadataInset {...inset} />
        <DarkCorner>{darkCorner}</DarkCorner>
      </ZoneCard>
    </div>
  );
}
