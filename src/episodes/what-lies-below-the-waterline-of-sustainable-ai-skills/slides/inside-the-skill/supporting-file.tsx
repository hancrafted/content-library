import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import { GuideTab } from './card-art';
import styles from './inside.module.css';

/*
 * A supporting file of Spec Option 16a, level with the step that uses it: a script or template as its object beside
 * its words, or the lit reference file as a book open on its contents page (feedback 3, decision 46).
 */

export interface SupportingFileProps {
  readonly step: number;
  readonly kind: string;
  readonly name: string;
  readonly hint: string;
  readonly path: string;
  readonly focal?: boolean;
  /** A reference file opens on its contents page. */
  readonly contents?: { readonly head: string; readonly rows: readonly { label: string; page: string }[] };
  /** The file drawn as an object beside its words (`card-art.tsx`); the lit reference file is a book instead. */
  readonly art?: ReactNode;
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

/** The file's AI term as a pill; the lit file's fills `primary`. */
function KindPill({ kind, focal }: { readonly kind: string; readonly focal: boolean }) {
  return (
    <p>
      <span
        data-kind
        className={cn(
          'rounded-full px-2 py-0.5 text-caption font-semibold',
          focal ? 'bg-primary text-primary-foreground' : 'bg-foreground text-background',
        )}
      >
        {kind}
      </span>
    </p>
  );
}

/** The file's words: its AI term, the scene's name, its hint or its path, and a reference file's contents page. */
function FileWords({ kind, name, hint, path, focal, contents }: Omit<SupportingFileProps, 'step' | 'art'>) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <KindPill kind={kind} focal={focal === true} />
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

/** The lit reference file as a book: its faceted cover and spine around the open page, its fish tab on top. */
function GuideBook({ step, ...words }: Omit<SupportingFileProps, 'focal' | 'art'>) {
  return (
    <div
      data-file={step}
      data-motion="slide-out"
      className={cn(
        styles.slideOut,
        styles.book,
        'focus-group__item relative min-w-0 flex-1 rounded-lg border-[3px] border-primary pt-2 pr-2 pb-2 pl-3',
      )}
    >
      <span aria-hidden className="pointer-events-none absolute -top-5 right-6">
        <GuideTab />
      </span>
      <div className={cn(styles.page, 'flex rounded-sm p-3 text-card-foreground')}>
        <FileWords {...words} focal />
      </div>
    </div>
  );
}

/**
 * One supporting file, led by its AI term, the scene's name beneath, its path in the Coding agent view. A script or
 * template stands as its object beside its words; the lit reference file is a book: its faceted cover and spine
 * around the open page, its fish tab on top, ringed in `primary`.
 */
export function SupportingFile({ step, focal = false, art, ...words }: SupportingFileProps) {
  if (focal) return <GuideBook step={step} {...words} />;
  return (
    <div
      data-file={step}
      className="focus-group__item flex min-w-0 flex-1 items-start gap-3 rounded-lg bg-card p-3 text-card-foreground shadow-md"
    >
      {art}
      <FileWords {...words} />
    </div>
  );
}
