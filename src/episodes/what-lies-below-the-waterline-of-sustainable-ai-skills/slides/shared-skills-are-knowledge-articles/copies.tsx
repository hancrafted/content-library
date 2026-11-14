import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneCard } from '@/episodes/components/slide-shared/iceberg/zone-card';
import { cn } from '@/shared/lib/utils';
import type { CSSProperties } from 'react';
import styles from './slide.module.css';

/** A pill naming which copy of the skill this is. */
function CopyPill({ children, dark }: { readonly children: string; readonly dark?: boolean }) {
  return (
    <span
      className={cn(
        'w-fit rounded-full px-3 py-0.5 text-caption font-semibold shadow-md',
        dark ? 'bg-card-foreground text-card' : 'bg-card text-card-foreground',
      )}
    >
      {children}
    </span>
  );
}

/** Your notebook copy: no header at all, only you run it. */
export function PersonalCopy({
  pill,
  sub,
  className,
}: {
  readonly pill: string;
  readonly sub: string;
  readonly className?: string;
}) {
  return (
    <div data-copy="personal" className={cn('flex flex-col gap-1', className)}>
      <CopyPill>{pill}</CopyPill>
      <ZoneCard className="w-fit rounded-md px-2 text-caption">{sub}</ZoneCard>
    </div>
  );
}

export interface ControlField {
  readonly key: string;
  readonly value: string;
  /** The field's `metadata` key in the Coding agent view; code, not translated. */
  readonly codingKey: string;
}

export interface SharedCopyProps {
  readonly pill: string;
  readonly heading: string;
  readonly fields: readonly ControlField[];
  readonly skill: { readonly name: string; readonly description: string; readonly step: string };
  /** The skill's folder name, for the front matter in the Coding agent view; code, not translated. */
  readonly slug: string;
  readonly className?: string;
}

/** The control block: owner, version and next review, or the `metadata` lines in the Coding agent view. */
function ControlBlock({ heading, fields }: Pick<SharedCopyProps, 'heading' | 'fields'>) {
  const metadata = [
    'metadata:',
    ...fields.map(({ codingKey, value }) => `  ${codingKey}: ${quoted(codingKey, value)}`),
  ];
  return (
    <div
      data-control-block
      data-motion="stamp"
      className={cn(styles.stamp, 'rounded-md bg-card-foreground px-3 py-2 text-card shadow-md')}
    >
      <InView view="chat" as="div" className="flex flex-col gap-1">
        <p className="text-caption font-semibold">{heading}</p>
        <dl className="grid grid-cols-3 gap-2">
          {fields.map(({ key, value }) => (
            <div key={key} className="flex flex-col">
              <dt className="text-caption opacity-80">{key}</dt>
              <dd className="text-caption font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </InView>
      <InView view="coding" as="div">
        <code translate="no" className="block font-mono text-caption whitespace-pre-wrap">
          {metadata.join('\n')}
        </code>
      </InView>
    </div>
  );
}

/** The skill itself under the control block: its card, or its front matter in the Coding agent view. */
function SkillCard({ skill, slug }: Pick<SharedCopyProps, 'skill' | 'slug'>) {
  return (
    <>
      <InView view="chat" as="div" className="flex flex-col gap-0.5 px-1">
        <p className="text-caption font-semibold">{skill.name}</p>
        <p className="text-caption text-muted-foreground italic">{skill.description}</p>
        <p className="truncate text-caption text-muted-foreground">{skill.step}</p>
      </InView>
      <InView view="coding" as="div" className="px-1">
        <code translate="no" className="block font-mono text-caption whitespace-pre-wrap text-muted-foreground">
          {`---\nname: ${slug}\ndescription: ${skill.description}\n---`}
        </code>
      </InView>
    </>
  );
}

/**
 * The same card in the fleet manual, with the control block stamped on top: owner, version, next review. In the
 * Coding agent view the page is the `SKILL.md` front matter and the control block its `metadata` lines.
 */
export function SharedCopy({ pill, heading, fields, skill, slug, className }: SharedCopyProps) {
  return (
    <div data-copy="shared" className={cn('flex flex-col items-start gap-2', className)}>
      <CopyPill dark>{pill}</CopyPill>
      <ZoneCard className="flex w-full flex-col gap-2 rounded-lg p-3 shadow-md">
        <ControlBlock heading={heading} fields={fields} />
        <SkillCard skill={skill} slug={slug} />
      </ZoneCard>
    </div>
  );
}

/** A version reads as a string in front matter, so YAML keeps `1.3` from becoming a number. */
const quoted = (key: string, value: string) => (key === 'version' ? `"${value}"` : value);

export interface ReaderLabel {
  readonly who: { readonly chat: string; readonly coding: string };
  readonly runs: string;
  readonly version: string;
}

/** Where each label sits over the room on a wide Slide: beside its console, as `READER_ROWS` place them. */
const READER_TOPS = ['31%', '52%', '73%'] as const;

/** One AI's label: who it is, and the version it runs. */
function Reader({ who, runs, version, top }: ReaderLabel & { readonly top: string }) {
  return (
    <li
      data-reach
      data-version={version}
      style={{ '--reader-top': top } as CSSProperties}
      className="@5xl:absolute @5xl:top-(--reader-top) @5xl:right-[1.5%] @5xl:w-[17%]"
    >
      <ZoneCard className="flex flex-col rounded-md px-2 py-1 shadow-md">
        <span className="text-caption font-semibold">
          <InView view="chat">{who.chat}</InView>
          <InView view="coding">{who.coding}</InView>
        </span>
        <span className="text-caption text-muted-foreground">
          <InView view="chat">{`${runs} ${version}`}</InView>
          <InView view="coding" className="font-mono">{`version: "${version}"`}</InView>
        </span>
      </ZoneCard>
    </li>
  );
}

/**
 * The three AIs the shared skill reaches, each running the same version. On a wide Slide each label sits over the room
 * beside its console; narrower, they flow as a list under the drawing.
 */
export function Readers({
  readers,
  className,
}: {
  readonly readers: readonly ReaderLabel[];
  readonly className?: string;
}) {
  return (
    <ul className={cn('grid gap-2', className)}>
      {readers.map((reader, index) => (
        <Reader key={reader.who.chat} {...reader} top={READER_TOPS[index] ?? '0'} />
      ))}
    </ul>
  );
}
