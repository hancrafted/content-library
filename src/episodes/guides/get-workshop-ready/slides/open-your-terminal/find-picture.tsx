import type { OsPick } from './stuck-prompt.pure';

export interface FindPictureProps {
  readonly os: OsPick;
  readonly query: string;
  readonly result: string;
  readonly resultKind: string;
  /** A dimmer hit under the right one, as Spotlight lists it. */
  readonly other?: string;
}

function TerminalGlyph() {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-foreground">
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
        <path
          d="M6 8l4 4-4 4M12 16h6"
          className="fill-none stroke-background"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function SearchRow({ query }: { query: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-card px-4 py-3">
      <svg viewBox="0 0 24 24" className="size-5 shrink-0" aria-hidden="true">
        <circle cx="10.5" cy="10.5" r="6" className="fill-none stroke-muted-foreground" strokeWidth="1.8" />
        <path d="M15 15l5 5" className="fill-none stroke-muted-foreground" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <span data-query className="text-body">
        {query}
      </span>
      <span className="h-5 w-px bg-foreground" aria-hidden="true" />
    </div>
  );
}

function Hit({ result, resultKind }: Pick<FindPictureProps, 'result' | 'resultKind'>) {
  return (
    <div className="mt-2 flex items-center gap-3 rounded-xl bg-selected px-4 py-2.5 text-selected-foreground">
      <TerminalGlyph />
      <span className="flex min-w-0 flex-col">
        <span className="text-body font-semibold">{result}</span>
        <span className="text-caption opacity-80">{resultKind}</span>
      </span>
    </div>
  );
}

/** The Linux app grid: the Terminal tile picked among the other apps. */
function AppGrid({ result }: { result: string }) {
  return (
    <div className="mt-2 grid grid-cols-3 gap-2" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((tile) => (
        <span key={tile} className="aspect-square rounded-xl bg-border" />
      ))}
      <span className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl bg-selected text-caption text-selected-foreground">
        <TerminalGlyph />
        {result}
      </span>
    </div>
  );
}

/**
 * Where the viewer finds the terminal on their system, drawn as their screen shows it: Spotlight on a Mac, the Start
 * search on Windows, the app grid on Linux, the right hit picked.
 */
export function FindPicture({ os, query, result, resultKind, other }: FindPictureProps) {
  return (
    <div data-find={os} className="rounded-2xl border border-border bg-muted p-3 shadow-md">
      <SearchRow query={query} />
      {os === 'linux' ? <AppGrid result={result} /> : <Hit result={result} resultKind={resultKind} />}
      {other && (
        <div className="mt-1 flex items-center gap-3 px-4 py-2 text-muted-foreground">
          <span className="size-8 shrink-0 rounded-lg bg-border" />
          <span className="text-caption">{other}</span>
        </div>
      )}
    </div>
  );
}
