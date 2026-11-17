import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneCard } from '@/episodes/components/slide-shared/iceberg/zone-card';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import { ART_CLASS, BinderArt, CORNER_INK, DarkCornerArt } from './library-art';
import styles from './slide.module.css';

export interface FrontRow {
  readonly slug: string;
  readonly term: string;
  readonly marker: ReactNode;
  readonly scene?: string;
  readonly chat: ReactNode;
  readonly coding: ReactNode;
  readonly target?: { readonly 'data-target': string };
}

export interface FrontPageProps {
  readonly label: string;
  readonly scope: string;
  readonly title: string;
  readonly rows: readonly FrontRow[];
  readonly inset: { readonly heading: ReactNode; readonly lines: readonly string[]; readonly note: string };
  readonly darkCorner: ReactNode;
  readonly className?: string;
}

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

function DarkCorner({ children }: { readonly children: ReactNode }) {
  return (
    <>
      <div
        data-dark-corner
        className="absolute right-3 bottom-3 h-32 w-[70%] @xl:right-7 @xl:bottom-6 @xl:h-1/4 @xl:w-2/5"
      >
        <DarkCornerArt />
      </div>
      <p
        className={cn(
          CORNER_INK,
          'absolute right-6 bottom-5 flex max-w-28 items-end gap-1 text-right text-caption italic @xl:right-12 @xl:bottom-8 @xl:max-w-32',
        )}
      >
        {children}
      </p>
    </>
  );
}

export function FrontPage({ label, scope, title, rows, inset, darkCorner, className }: FrontPageProps) {
  return (
    <div data-motion="zoom" className={cn(styles.page, ART_CLASS, 'relative', className)}>
      <BinderArt />
      <ZoneCard className="relative flex flex-col gap-3 bg-transparent! px-10 pt-8 pb-40 @xl:px-14 @xl:pb-36">
        <p className="flex flex-wrap items-center justify-between gap-2 text-caption text-muted-foreground">
          {label}
          <span className="rounded-full bg-primary px-3 py-0.5 font-semibold text-primary-foreground">{scope}</span>
        </p>
        <p className="text-body font-semibold">{title}</p>
        <ol className="focus-group focus-group--dim-others flex flex-col pr-4">
          {rows.map((row) => (
            <Row key={row.slug} {...row} />
          ))}
        </ol>
        <MetadataInset {...inset} />
      </ZoneCard>
      <DarkCorner>{darkCorner}</DarkCorner>
    </div>
  );
}
