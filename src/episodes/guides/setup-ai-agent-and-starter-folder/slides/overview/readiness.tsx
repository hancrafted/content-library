import { WatchCard, type WatchCardProps } from '@/episodes/components/slide-shared/watch-card/watch-card';
import { type Locale } from '@/shared/lib/locale.pure';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import type { OverviewView, ReadyFlags } from './ready-state.pure';

export interface ReadinessWords {
  readonly readyTitle: string;
  readonly missingTitle: string;
  readonly recap: readonly string[];
  readonly skillsDone: string;
  readonly skillsMissing: string;
  readonly localSetupDone: string;
  readonly localSetupMissing: string;
  readonly watchTitle: string;
  readonly reopen: string;
}

/** An unlisted Episode to watch while waiting, as its card draws it. */
export type WatchLink = Omit<WatchCardProps, 'locale'>;

export interface ViewBodyProps {
  readonly view: OverviewView;
  readonly words: ReadinessWords;
  readonly watch: readonly WatchLink[];
  readonly locale: Locale;
  /** The normal checklist with its "Start at" card. */
  readonly normal: ReactNode;
  /** The Help note, shown under the ready card, where the checklist is gone. */
  readonly stuck: ReactNode;
  /** Set when the ready view came from ticking the check skill: takes the tick back and shows the checklist again. */
  readonly onReopen?: () => void;
}

function Mark({ done }: { done: boolean }) {
  return (
    <span
      data-mark={done ? 'done' : 'open'}
      className={
        done
          ? 'grid size-6 shrink-0 place-items-center rounded-full bg-(--success) text-(--success-foreground)'
          : 'grid size-6 shrink-0 place-items-center rounded-full border-2 border-brand-accent text-brand-accent'
      }
    >
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
        <path
          d={done ? 'M5 12.5l4.5 4.5L19 7.5' : 'M12 7v6M12 17h.01'}
          className="fill-none stroke-current"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function Line({ done, children }: { done: boolean; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-body">
      <Mark done={done} />
      <span>{children}</span>
    </li>
  );
}

function Check({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M5 12.5l4.5 4.5L19 7.5"
        className="fill-none stroke-current"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const DONE_DISC = 'grid shrink-0 place-items-center rounded-full bg-(--success) text-(--success-foreground)';

/** Takes the "I ran the check skill" tick back, so the checklist shows again. */
function Reopen({ label, onReopen }: { label: string; onReopen: () => void }) {
  return (
    <button
      type="button"
      data-reopen
      onClick={onReopen}
      className="inline-flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 text-caption font-medium outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ArrowLeft aria-hidden="true" className="size-4 shrink-0" />
      {label}
    </button>
  );
}

/** The three lines of what is done, each with a green check. */
function RecapList({ recap }: { recap: readonly string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {recap.map((line) => (
        <li key={line} className="flex items-start gap-3 text-body">
          <span className={`${DONE_DISC} size-6`}>
            <Check className="size-4" />
          </span>
          <span data-recap="done">{line}</span>
        </li>
      ))}
    </ul>
  );
}

/** The ready card: a green check and a prominent title over the three done lines. */
function ReadyCard({
  words,
  onReopen,
  children,
}: {
  words: ReadinessWords;
  onReopen?: () => void;
  children: ReactNode;
}) {
  return (
    <section
      data-view="ready"
      className="flex flex-col gap-4 rounded-2xl border-2 border-(--success) bg-(--success)/10 p-6"
    >
      <p className="flex items-center gap-3 text-subheading font-semibold">
        <span className={`${DONE_DISC} size-9`}>
          <Check className="size-6" />
        </span>
        {words.readyTitle}
      </p>
      <RecapList recap={words.recap} />
      {onReopen && <Reopen label={words.reopen} onReopen={onReopen} />}
      {children}
    </section>
  );
}

/** The missing card: one line per reported piece, each done or open. */
function MissingCard({ flags, words }: { flags: ReadyFlags; words: ReadinessWords }) {
  const { skills, localSetup } = flags;
  return (
    <section
      data-view="missing"
      className="flex flex-col gap-4 rounded-2xl border-2 border-brand-accent bg-brand-accent/10 p-6"
    >
      <p className="text-subheading font-semibold">{words.missingTitle}</p>
      <ul className="flex flex-col gap-2">
        {skills !== undefined && <Line done={skills}>{skills ? words.skillsDone : words.skillsMissing}</Line>}
        {localSetup !== undefined && (
          <Line done={localSetup}>{localSetup ? words.localSetupDone : words.localSetupMissing}</Line>
        )}
      </ul>
    </section>
  );
}

/** The recap card: three done lines when ready, one line per reported piece when something is missing. */
function RecapCard({
  view,
  words,
  watch,
  locale,
  onReopen,
}: Pick<ViewBodyProps, 'view' | 'words' | 'watch' | 'locale' | 'onReopen'>) {
  if (view.kind === 'ready') {
    return (
      <ReadyCard words={words} onReopen={onReopen}>
        <Watch words={words} watch={watch} locale={locale} />
      </ReadyCard>
    );
  }
  if (view.kind !== 'missing') return null;
  return <MissingCard flags={view.flags} words={words} />;
}

function Watch({ words, watch, locale }: Pick<ViewBodyProps, 'words' | 'watch' | 'locale'>) {
  return (
    <section data-watch className="flex flex-col gap-3">
      <p className="text-body font-semibold">{words.watchTitle}</p>
      <div className="grid gap-4 @3xl:grid-cols-2">
        {watch.map((link) => (
          <WatchCard key={link.route} {...link} locale={locale} />
        ))}
      </div>
    </section>
  );
}

/**
 * The Overview Scene body for one view: pure and presentational, so the test renders each view directly. `normal`
 * shows the checklist; `ready` replaces it with the recap card; `missing` puts the recap above the checklist.
 */
export function ViewBody({ view, words, watch, locale, normal, stuck, onReopen }: ViewBodyProps) {
  if (view.kind === 'normal') return <>{normal}</>;
  return (
    <div className="flex flex-col gap-6">
      <RecapCard view={view} words={words} watch={watch} locale={locale} onReopen={onReopen} />
      {view.kind === 'missing' ? normal : stuck}
      {view.kind === 'missing' && <Watch words={words} watch={watch} locale={locale} />}
    </div>
  );
}
