import { TickIcon } from '@/episodes/components/slide-shared/agent-setup-step/copy-icons';
import { CopyButton, type CopyWords } from '@/episodes/components/slide-shared/agent-setup-step/copy-line.client';
import { externalHref } from '@/shared/lib/external-link.pure';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import { ArrowIcon, CheckboxIcon, DownloadIcon, ExternalIcon } from './icons';

/*
 * The static drawings of Option 8a: the vendor link, the installer's question, the setup
 * skill's four answers, the check bundle and the homepage strip. Each takes its words as props.
 */

/** A labelled pill to a vendor's own page, with the external-link mark: never a pasted URL (Visual language). */
export function OfficialLink({ url, newTab, children }: { url: string; newTab: string; children: ReactNode }) {
  return (
    <a
      href={externalHref(url)}
      target="_blank"
      rel="noopener noreferrer"
      className="card-hover card-hover--raise inline-flex items-center gap-3 self-start rounded-full border border-border bg-background px-5 py-2 text-body font-semibold shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
      <ExternalIcon />
      <span className="sr-only">{newTab}</span>
    </a>
  );
}

/** One group the installer offers: its name (not translated), what it holds, and whether to tick it. */
export interface PickerGroup {
  readonly name: string;
  readonly holds: string;
  readonly picked: boolean;
}

/** One line of the installer's list: the checkbox, the group's name and what it holds. */
function PickerLine({ group }: { group: PickerGroup }) {
  return (
    <p
      data-picked={group.picked || undefined}
      className={cn(
        'flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md px-2 py-1',
        group.picked ? 'border border-primary bg-primary/10' : 'text-muted-foreground',
      )}
    >
      <CheckboxIcon ticked={group.picked} />
      <span className={cn('whitespace-nowrap', group.picked && 'font-semibold text-foreground')}>{group.name}</span>
      <span className="text-muted-foreground">{group.holds}</span>
    </p>
  );
}

/** A still drawing of the skills installer's question: the groups it offers, the one to keep ticked. */
export function SkillPicker({ question, groups }: { question: string; groups: readonly PickerGroup[] }) {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col gap-2 rounded-lg border border-border bg-background px-4 py-3 font-mono text-caption"
    >
      <p className="text-muted-foreground">{question}</p>
      {groups.map((group) => (
        <PickerLine key={group.name} group={group} />
      ))}
    </div>
  );
}

/** One question the setup skill asks, and the answer to give. */
export interface SetupAnswer {
  readonly question: string;
  readonly answer: ReactNode;
}

/** The setup skill's answers as a 2 × 2 hairline card (one column on a narrow container). */
export function SetupAnswers({ answers }: { answers: readonly SetupAnswer[] }) {
  return (
    <dl className="grid gap-px overflow-hidden rounded-lg border border-border bg-border text-caption @md:grid-cols-2">
      {answers.map(({ question, answer }) => (
        <div key={question} className="flex flex-col gap-1 bg-background px-4 py-3">
          <dt className="uppercase text-muted-foreground">{question}</dt>
          <dd className="font-semibold">{answer}</dd>
        </div>
      ))}
    </dl>
  );
}

/** The words of the check bundle: the download pill's name and size, and the entry block's label. */
export interface BundleWords {
  readonly link: string;
  readonly size: string;
  readonly entryLabel: string;
}

/** The hancrafted entry to paste into `GLOSSARY.md`: its term, its line, and its copy button. */
function GlossaryEntry({ label, entry, words }: { label: string; entry: string; words: CopyWords }) {
  const [term, ...rest] = entry.split('\n');
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted py-2 pr-1 pl-4 font-mono text-caption">
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">{label}</span>
        <CopyButton text={entry} words={words} />
      </div>
      <p className="font-semibold text-foreground">{term}</p>
      {rest.map((line) => (
        <p key={line} className="break-all pr-3 text-foreground">
          {line}
        </p>
      ))}
    </div>
  );
}

/**
 * Our two pieces for this route: the dashed download pill for the check skill folder, and the hancrafted entry to
 * paste into `GLOSSARY.md`. The pill is drawn but links nowhere (`data-placeholder`): the small zip does not exist
 * yet, so it becomes a link once the artifact sits in `public/`.
 */
export function CheckBundle({
  bundle,
  glossaryEntry,
  words,
}: {
  bundle: BundleWords;
  glossaryEntry: string;
  words: CopyWords;
}) {
  return (
    <div data-check-bundle className="flex flex-col gap-3">
      <span
        data-zip
        data-placeholder
        className="inline-flex flex-wrap items-center gap-2 self-start rounded-full border border-dashed border-primary bg-background px-4 py-2 text-caption font-semibold shadow-sm"
      >
        <DownloadIcon />
        {bundle.link}
        <span className="font-normal text-muted-foreground">{bundle.size}</span>
      </span>
      <GlossaryEntry label={bundle.entryLabel} entry={glossaryEntry} words={words} />
    </div>
  );
}

/** The proof: an arrow onto a small browser bar on hancrafted.net, and the success tick. */
export function HomepageResult({ site, name, opens }: { site: string; name: string; opens: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <ArrowIcon />
      <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-border bg-background px-3 py-2">
        <span className="flex gap-1" aria-hidden="true">
          <span className="size-2 rounded-full bg-muted-foreground/30" />
          <span className="size-2 rounded-full bg-muted-foreground/30" />
          <span className="size-2 rounded-full bg-muted-foreground/30" />
        </span>
        <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-caption text-muted-foreground">{site}</span>
        <span className="text-caption font-semibold">{name}</span>
      </div>
      <span className="inline-flex items-center gap-1 text-caption font-semibold">
        <TickIcon className="text-(--success)" />
        {opens}
      </span>
    </div>
  );
}
