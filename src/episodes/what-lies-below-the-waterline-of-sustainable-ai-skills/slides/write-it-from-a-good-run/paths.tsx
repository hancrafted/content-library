import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneCard } from '@/episodes/components/slide-shared/iceberg/zone-card';
import type { TargetProps } from '@/shared/lib/context-link.pure';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import styles from './slide.module.css';

/** The skill's name and file, as Slides 3 and 6 give them: code, not translated. */
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

/** The logbook pages of earlier dives, pinned up, each with its date. */
function Logbook({ label, pages }: { readonly label: string; readonly pages: readonly string[] }) {
  return (
    <div role="img" aria-label={label} className="flex items-end gap-2 self-start rounded-md bg-muted p-3">
      {pages.map((page, index) => (
        <span
          key={page}
          aria-hidden
          className={cn(
            'flex h-16 w-14 flex-col gap-1 rounded-sm border border-border bg-card p-1 text-caption shadow-sm',
            index === 0 ? '-rotate-3' : index === 1 ? 'rotate-2' : '',
          )}
        >
          <span className="font-semibold">{page}</span>
          <span className="h-px bg-border" />
          <span className="h-px bg-border" />
        </span>
      ))}
    </div>
  );
}

/** The second path: your logbook pages from earlier dives, written up into the same skill, its arrow into the card. */
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

/** The one card both sources fold into: steps with their why, and what counts as failure; in the coding view, SKILL.md. */
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
