import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import styles from './inside.module.css';

/*
 * The parts of Spec Option 16a, one row per step: the step on the card in its sleeve, the supporting file it uses
 * level with it, and the rules for long files beside. Markup is this Slide's own (FE-007 §4); colours come from the
 * Slide token file.
 */

export interface StepCellProps {
  readonly n: number;
  readonly text: string;
  /** The step's pointer to its file, as the chat app reads it and as the coding agent's file says it. */
  readonly pointer?: { readonly chat: string; readonly coding: string };
  /** A step that runs long: its first lines, then how many more. */
  readonly long?: { readonly text: string; readonly more: string };
  readonly focus?: boolean;
  readonly last?: boolean;
}

/** A step's pointer to its file, in each view. */
function Pointer({ pointer }: { readonly pointer: NonNullable<StepCellProps['pointer']> }) {
  return (
    <>
      <InView view="chat" as="p" className="pl-5 text-caption">
        <span data-pointer>{pointer.chat}</span>
      </InView>
      <InView view="coding" as="p" className="pl-5 font-mono text-caption break-words">
        <span data-pointer>{pointer.coding}</span>
      </InView>
    </>
  );
}

/** A long step's first lines, then how many more. */
function LongLines({ long }: { readonly long: NonNullable<StepCellProps['long']> }) {
  return (
    <>
      <p className="pl-5 text-caption text-muted-foreground">{long.text}</p>
      <p data-long className="pl-5 text-caption font-semibold">
        {long.more}
      </p>
    </>
  );
}

/** The step's lit marks and classes: step 4 fills `primary` and is marked for the drawer and browser checks. */
function stepLook(focus: boolean, last: boolean) {
  const tone = focus ? cn(styles.lit, 'bg-primary text-primary-foreground') : undefined;
  return {
    marks: focus ? { 'data-focus': '', 'data-motion': 'lit' } : {},
    className: cn(styles.step, 'border-x-8 bg-card px-2 py-1 text-card-foreground', last && 'rounded-b-lg border-b-8'),
    row: cn('flex flex-col gap-1 rounded-md px-2 py-2', tone),
    number: focus ? undefined : 'text-muted-foreground',
  };
}

/** One step on the procedure card; the card's sleeve shows at both sides, its foot under the last step. */
export function StepCell({ n, text, pointer, long, focus, last }: StepCellProps) {
  const look = stepLook(focus === true, last === true);
  return (
    <div data-step={n} {...look.marks} className={look.className}>
      <div className={look.row}>
        <p className="text-body font-semibold">
          <span className={look.number}>{n}.</span> {text}
        </p>
        {pointer && <Pointer pointer={pointer} />}
        {long && <LongLines long={long} />}
      </div>
    </div>
  );
}

/** The card's head inside the sleeve: what the card is and its title. */
export function CardHead({ label, title }: { readonly label: string; readonly title: string }) {
  return (
    <div className={cn(styles.step, 'rounded-t-lg border-x-8 border-t-8 bg-card px-4 pt-4 pb-1 text-card-foreground')}>
      <p className="text-caption text-muted-foreground">{label}</p>
      <p className="text-body font-semibold">{title}</p>
    </div>
  );
}

/** The arrow from a step to its file: dashed, or solid for the lit step. Wide screens only. */
export function StepArrow({ focal = false, long = false }: { readonly focal?: boolean; readonly long?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'hidden shrink-0 border-t-2 @4xl:block',
        long ? 'flex-1' : 'w-8',
        focal ? 'border-foreground' : 'border-dashed border-foreground',
      )}
    />
  );
}

export interface SupportingFileProps {
  readonly step: number;
  readonly kind: string;
  readonly name: string;
  readonly hint: string;
  readonly path: string;
  readonly focal?: boolean;
  /** A reference file opens on its contents page. */
  readonly contents?: { readonly head: string; readonly rows: readonly { label: string; page: string }[] };
}

/** The reference file's contents page, open where the guide slid out. */
function ContentsPage({ contents }: { readonly contents: NonNullable<SupportingFileProps['contents']> }) {
  return (
    <div className="mt-1 border-t border-border pt-2">
      <p className="text-caption font-semibold">{contents.head}</p>
      <ol data-contents className="mt-1 flex flex-col text-caption">
        {contents.rows.map(({ label, page }) => (
          <li key={label} className="flex justify-between gap-3">
            <span>{label}</span>
            <span className="text-muted-foreground">{page}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** The file's AI term as a pill. */
function KindPill({ kind }: { readonly kind: string }) {
  return (
    <p>
      <span data-kind className="rounded-full bg-foreground px-2 py-0.5 text-caption font-semibold text-background">
        {kind}
      </span>
    </p>
  );
}

/** One supporting file, led by its AI term, the scene's name beneath, its path in the Coding agent view. */
export function SupportingFile({ step, kind, name, hint, path, focal = false, contents }: SupportingFileProps) {
  return (
    <div
      data-file={step}
      data-motion={focal ? 'slide-out' : undefined}
      className={cn(
        'focus-group__item flex min-w-0 flex-1 flex-col gap-1 rounded-lg bg-card p-3 text-card-foreground shadow-md',
        focal && cn(styles.slideOut, 'border-2 border-foreground'),
      )}
    >
      <KindPill kind={kind} />
      <p className="text-body font-semibold">{name}</p>
      <InView view="chat" as="p" className="text-caption text-muted-foreground">
        {hint}
      </InView>
      <InView view="coding" as="p" className="font-mono text-caption break-all text-muted-foreground">
        {path}
      </InView>
      {contents && <ContentsPage contents={contents} />}
    </div>
  );
}

/** One of the two rules for long files: a white card. */
export function SkillNote({ children, ...props }: { readonly children: ReactNode; readonly 'data-target'?: string }) {
  return (
    <p {...props} className="rounded-lg bg-card p-4 text-body text-card-foreground shadow-md">
      {children}
    </p>
  );
}

/** The skill's folder in the Coding agent view, every file one level under SKILL.md. Paths are code. */
export function SkillTree({
  label,
  root,
  entries,
}: {
  readonly label: ReactNode;
  readonly root: string;
  readonly entries: readonly { readonly path: string; readonly focal?: boolean }[];
}) {
  return (
    <InView view="coding" as="div" className="flex flex-col gap-1">
      <p className="text-caption text-muted-foreground">{label}</p>
      <pre
        translate="no"
        className="rounded-md bg-foreground px-3 py-2 font-mono text-caption whitespace-pre-wrap text-background"
      >
        {root}
        {entries.map(({ path, focal }) => (
          <span key={path} className={cn('block pl-4', focal && 'font-semibold underline')}>
            {path}
          </span>
        ))}
      </pre>
    </InView>
  );
}
