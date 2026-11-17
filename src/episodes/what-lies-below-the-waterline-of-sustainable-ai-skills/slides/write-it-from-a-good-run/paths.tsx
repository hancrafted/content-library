import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneCard } from '@/episodes/components/slide-shared/iceberg/zone-card';
import type { TargetProps } from '@/shared/lib/context-link.pure';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import artStyles from './day-art.module.css';
import { LOGBOOK, LOGBOOK_ART, PAGE_DATES } from './logbook-facets';
import styles from './slide.module.css';

const SKILL_NAME = 'collect-sediment-sample';

interface NotesLaneProps {
  readonly heading: string;
  readonly story: string;
  readonly chat: string;
  readonly coding: ReactNode;
  readonly tip: string;
  readonly logbook: { readonly label: string; readonly pages: readonly string[] };
  readonly targetProps: TargetProps;
}

function PageDate({ page, index }: { readonly page: string; readonly index: number }) {
  const date = PAGE_DATES[index];
  if (!date) return null;
  return (
    <span
      aria-hidden
      style={{
        left: `${(date.x / LOGBOOK_ART.width) * 100}%`,
        top: `${(date.y / LOGBOOK_ART.height) * 100}%`,
        rotate: `${date.tilt}deg`,
      }}
      className={cn(artStyles.ink, 'absolute -translate-y-full text-caption leading-none font-semibold')}
    >
      {page}
    </span>
  );
}

function Logbook({ label, pages }: { readonly label: string; readonly pages: readonly string[] }) {
  return (
    <div
      role="img"
      aria-label={label}
      data-logbook
      className={cn(artStyles.art, 'relative max-w-72 min-w-40 shrink-0 grow basis-40 self-start')}
    >
      <svg
        viewBox={`0 0 ${LOGBOOK_ART.width} ${LOGBOOK_ART.height}`}
        aria-hidden
        className="block h-auto w-full rounded-lg"
      >
        {LOGBOOK.map(([tone, d], index) => (
          <path key={index} data-tone={tone} d={d} />
        ))}
      </svg>
      {pages.map((page, index) => (
        <PageDate key={page} page={page} index={index} />
      ))}
    </div>
  );
}

export function NotesLane({ heading, story, chat, coding, tip, logbook, targetProps }: NotesLaneProps) {
  return (
    <div data-notes-lane className="flex items-center gap-3 @5xl:col-span-2">
      <ZoneCard {...targetProps} className="flex flex-1 flex-wrap gap-4 rounded-lg p-4 shadow-md">
        <Logbook label={logbook.label} pages={logbook.pages} />
        <div className="flex min-w-48 flex-1 flex-col gap-2">
          <p className="text-body font-semibold">{heading}</p>
          <p className="text-caption text-muted-foreground">{story}</p>
          <InView view="chat" as="p" className="text-caption">
            {chat}
          </InView>
          <InView view="coding" as="p" className="text-caption">
            {coding}
          </InView>
          <p className="text-caption text-muted-foreground">{tip}</p>
        </div>
      </ZoneCard>
      <span aria-hidden className={cn(styles.arrow, 'hidden text-heading text-primary @5xl:block')}>
        →
      </span>
    </div>
  );
}

interface SkillCardProps {
  readonly label: string;
  readonly title: string;
  readonly steps: readonly { readonly text: string; readonly why?: string }[];
  readonly failedIf: string;
  readonly file: readonly string[];
}

export function SkillCard({ label, title, steps, failedIf, file }: SkillCardProps) {
  return (
    <ZoneCard data-skill-card className="w-full rounded-lg border-2 border-foreground p-4 shadow-md">
      <InView view="chat" as="div" className="flex flex-col gap-2">
        <p className="text-caption font-semibold">{label}</p>
        <p className="text-body font-semibold">{title}</p>
        <ol className="flex flex-col gap-2 text-caption">
          {steps.map(({ text, why }, index) => (
            <li key={text}>
              <b>{index + 1}</b> {text} {why && <span className="text-muted-foreground">{why}</span>}
            </li>
          ))}
        </ol>
        <p data-failed-if className="rounded-md bg-destructive/10 px-2 py-1 text-caption">
          {failedIf}
        </p>
      </InView>
      <InView view="coding" as="div" className="flex flex-col gap-2">
        <p className="font-mono text-caption font-semibold break-all">{`${SKILL_NAME}/SKILL.md`}</p>
        <code className="flex flex-col text-caption">
          {file.map((line, index) => (
            <span key={index}>{line}</span>
          ))}
        </code>
      </InView>
    </ZoneCard>
  );
}
