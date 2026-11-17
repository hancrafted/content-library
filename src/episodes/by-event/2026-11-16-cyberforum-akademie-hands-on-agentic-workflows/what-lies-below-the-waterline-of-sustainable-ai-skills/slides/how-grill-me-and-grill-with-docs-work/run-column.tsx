import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import { PaperArt, type PaperId } from './paper-art';
import styles from './slide.module.css';

export interface GlossaryTerm {
  readonly slug: string;
  readonly chat: { readonly name: string; readonly text: string; readonly avoid?: string };
  readonly coding: { readonly name: string; readonly text: string; readonly avoid?: string };
  readonly isNew?: boolean;
}

export interface ProjectFileProps {
  readonly paper: PaperId;
  readonly kind: { readonly chat: string; readonly coding: string };
  readonly beside: string;
  readonly focus?: boolean;
  readonly tag?: string;
  readonly children: ReactNode;
}

function FileHeading({ kind, tag }: Pick<ProjectFileProps, 'kind' | 'tag'>) {
  return (
    <h5 className="flex items-center justify-between gap-2 border-b border-border pb-1 font-semibold text-muted-foreground">
      <span>
        <InView view="chat">{kind.chat}</InView>
        <InView view="coding" className="font-mono">
          {kind.coding}
        </InView>
      </span>
      {tag && (
        <span className={cn(styles.added, 'rounded-full border border-foreground px-2 text-foreground')}>{tag}</span>
      )}
    </h5>
  );
}

export function ProjectFile({ paper, kind, beside, focus = false, tag, children }: ProjectFileProps) {
  return (
    <div className="flex flex-col items-start gap-2">
      <section
        data-project-file={kind.coding}
        data-focus={focus ? '' : undefined}
        className={cn(
          styles.paper,
          'relative isolate flex w-full flex-1 flex-col gap-2 p-3 text-caption',
          focus && 'rounded-md ring-3 ring-primary ring-offset-2 ring-offset-transparent',
        )}
      >
        <PaperArt paper={paper} />
        <FileHeading kind={kind} tag={tag} />
        {children}
      </section>
      <p className="rounded-full bg-foreground px-3 text-caption font-semibold text-background">{beside}</p>
    </div>
  );
}

function TermLine({ name, text, avoid }: GlossaryTerm['chat']) {
  return (
    <>
      <b data-term-name className="font-semibold">
        {name}
      </b>
      : {text}
      {avoid && <span className="block italic">{avoid}</span>}
    </>
  );
}

function TermItem({ term: { slug, chat, coding, isNew } }: { readonly term: GlossaryTerm }) {
  return (
    <li
      data-term={slug}
      data-new={isNew ? '' : undefined}
      className={cn(isNew && cn(styles.newTerm, 'rounded-md px-2 py-1'))}
    >
      <InView view="chat">
        <TermLine {...chat} />
      </InView>
      <InView view="coding" className="font-mono">
        <TermLine {...coding} />
      </InView>
    </li>
  );
}

export function GlossaryTerms({
  heading,
  terms,
}: {
  readonly heading: { readonly chat: string; readonly coding: string };
  readonly terms: readonly GlossaryTerm[];
}) {
  return (
    <>
      <p className="font-semibold">
        <InView view="chat">{heading.chat}</InView>
        <InView view="coding" className="font-mono">
          {heading.coding}
        </InView>
      </p>
      <ul className="flex flex-col gap-1">
        {terms.map((term) => (
          <TermItem key={term.slug} term={term} />
        ))}
      </ul>
    </>
  );
}

export interface RunColumnProps {
  readonly n: number;
  readonly label: string;
  readonly lead: { readonly chat: string; readonly coding: ReactNode };
  readonly after?: ReactNode;
  readonly target?: { readonly 'data-target': string };
  readonly children: ReactNode;
}

export function RunColumn({ n, label, lead, after, target, children }: RunColumnProps) {
  return (
    <section data-run={n} className="flex flex-col gap-3">
      <p
        {...target}
        className="flex w-fit flex-wrap items-center gap-2 rounded-full bg-card py-1 pr-2 pl-1 text-caption font-semibold text-card-foreground shadow-md"
      >
        <span className="rounded-full bg-foreground px-2 text-background">{label}</span>
        <InView view="chat">{lead.chat}</InView>
        <InView view="coding">{lead.coding}</InView>
        {after}
      </p>
      <div className="grid flex-1 grid-cols-2 gap-3">{children}</div>
    </section>
  );
}
