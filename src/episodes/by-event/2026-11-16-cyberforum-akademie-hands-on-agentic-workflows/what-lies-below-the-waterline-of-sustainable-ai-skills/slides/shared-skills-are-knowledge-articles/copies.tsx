import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneCard } from '@/episodes/components/slide-shared/iceberg/zone-card';
import { cn } from '@/shared/lib/utils';
import type { CSSProperties } from 'react';
import styles from './slide.module.css';

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
  readonly codingKey: string;
}

export interface SharedCopyProps {
  readonly pill: string;
  readonly heading: string;
  readonly fields: readonly ControlField[];
  readonly skill: { readonly name: string; readonly description: string; readonly step: string };
  readonly slug: string;
  readonly className?: string;
}

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

export function SharedCopy({ pill, heading, fields, skill, slug, className }: SharedCopyProps) {
  return (
    <div data-copy="shared" className={cn('flex flex-col items-start gap-2 @5xl:items-center @5xl:gap-3', className)}>
      <CopyPill dark>{pill}</CopyPill>
      <ZoneCard className="flex w-full flex-col gap-2 rounded-lg p-3 shadow-md @5xl:bg-transparent! @5xl:px-1 @5xl:py-0 @5xl:shadow-none">
        <ControlBlock heading={heading} fields={fields} />
        <SkillCard skill={skill} slug={slug} />
      </ZoneCard>
    </div>
  );
}

const quoted = (key: string, value: string) => (key === 'version' ? `"${value}"` : value);

export interface ReaderLabel {
  readonly who: { readonly chat: string; readonly coding: string };
  readonly runs: string;
  readonly version: string;
}

const READER_TOPS = ['30.4%', '51.1%', '71.8%'] as const;

function Reader({ who, runs, version, top }: ReaderLabel & { readonly top: string }) {
  return (
    <li
      data-reach
      data-version={version}
      style={{ '--reader-top': top } as CSSProperties}
      className="@5xl:absolute @5xl:top-(--reader-top) @5xl:right-[1%] @5xl:left-[85%]"
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
