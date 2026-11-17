import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneCard } from '@/episodes/components/slide-shared/iceberg/zone-card';
import type { TargetProps } from '@/shared/lib/context-link.pure';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import { SheetClip, SheetPaper } from './room-art';
import styles from './slide.module.css';

interface Description {
  readonly tag: string;
  readonly verdict: string;
  readonly text: ReactNode;
  readonly coding: ReactNode;
}

interface Moment extends Description {
  readonly notFor: ReactNode;
  readonly notForCoding: string;
  readonly hedge: ReactNode;
  readonly marker: ReactNode;
}

interface Heading {
  readonly title: string;
  readonly note: ReactNode;
}

export interface SkillIndexSheetProps {
  readonly name: string;
  readonly slug: string;
  readonly chat: Heading;
  readonly coding: Heading & { readonly hedge: ReactNode };
  readonly content: Description;
  readonly moment: Moment;
  readonly target: TargetProps;
  readonly className?: string;
}

function SheetHeading({ heading }: { readonly heading: Heading }) {
  return (
    <div>
      <p className="text-body font-semibold">{heading.title}</p>
      <p className="text-caption text-muted-foreground">{heading.note}</p>
    </div>
  );
}

function ContentLine({ name, content }: { readonly name: string; readonly content: Description }) {
  return (
    <div data-description="content" className="rounded-lg border border-border px-4 py-3">
      <p className="flex flex-wrap justify-between gap-2 text-caption font-semibold text-muted-foreground">
        <span>{content.tag}</span>
        <span className="text-destructive">✗ {content.verdict}</span>
      </p>
      <p className="mt-1 text-body text-muted-foreground">
        <b className="font-semibold">{name}</b>: {content.text}
      </p>
    </div>
  );
}

function MomentLine({ name, moment }: { readonly name: string; readonly moment: Moment }) {
  return (
    <div data-description="moment" data-match="" className={cn('rounded-lg bg-card px-4 py-3 shadow-md', styles.ring)}>
      <p className="flex flex-wrap items-center justify-between gap-2 text-caption font-semibold">
        <span className="flex items-center gap-1 text-primary">
          {moment.tag}
          {moment.marker}
        </span>
        <span className={cn('rounded-full bg-primary px-2.5 py-0.5 text-primary-foreground', styles.verdict)}>
          ✓ {moment.verdict}
        </span>
      </p>
      <p className="mt-1 text-body">
        <b className="font-semibold">{name}</b>: {moment.text}
      </p>
      <div className="mt-2 flex flex-col gap-1 rounded-md border-2 border-dashed border-border px-2 py-1 text-muted-foreground">
        <span className="flex items-center gap-1 text-body">{moment.notFor}</span>
        <span className="flex items-center gap-1 text-caption">{moment.hedge}</span>
      </div>
    </div>
  );
}

function ContentDraft({ content }: { readonly content: Description }) {
  return (
    <div className="opacity-60">
      <p className="mb-1 text-caption font-semibold text-muted-foreground">{content.tag}</p>
      <code translate="no" className="block rounded-lg bg-foreground px-4 py-2 font-mono text-caption text-background">
        description: {content.coding}
      </code>
    </div>
  );
}

function FrontMatterDrafts({ slug, coding, content, moment }: Omit<SkillIndexSheetProps, 'name' | 'chat' | 'target'>) {
  return (
    <InView view="coding" as="div" className="relative flex flex-col gap-3">
      <SheetHeading heading={coding} />
      <ContentDraft content={content} />
      <div>
        <p className="mb-1 flex items-center gap-1 text-caption font-semibold text-primary">
          {moment.tag}
          {moment.marker}
        </p>
        <code
          translate="no"
          className={cn('block rounded-lg bg-foreground px-4 py-2 font-mono text-caption text-background', styles.ring)}
        >
          <span className="block">---</span>
          <span className="block">name: {slug}</span>
          <span className="block">
            description: {moment.coding}{' '}
            <span className="border-b-2 border-dashed border-background">{moment.notForCoding}</span>
          </span>
          <span className="block">---</span>
        </code>
      </div>
      <div className="flex flex-wrap items-center gap-1 text-caption text-muted-foreground">{coding.hedge}</div>
    </InView>
  );
}

export function SkillIndexSheet({
  name,
  slug,
  chat,
  coding,
  content,
  moment,
  target,
  className,
}: SkillIndexSheetProps) {
  return (
    <ZoneCard {...target} className={cn('relative flex flex-col p-5', className)}>
      <SheetPaper />
      <SheetClip />
      <InView view="chat" as="div" className="relative flex flex-col gap-4">
        <SheetHeading heading={chat} />
        <ContentLine name={name} content={content} />
        <MomentLine name={name} moment={moment} />
      </InView>
      <FrontMatterDrafts slug={slug} coding={coding} content={content} moment={moment} />
    </ZoneCard>
  );
}
