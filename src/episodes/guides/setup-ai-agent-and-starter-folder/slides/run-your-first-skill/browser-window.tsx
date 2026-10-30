import type { ReactNode } from 'react';
import { WindowDots } from './permission-prompt';

/** The viewer's default browser: a title bar with its address pill, and the page it shows. */
export function BrowserWindow({ address, children }: { address: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border bg-muted px-4 py-2">
        <WindowDots />
        <span className="min-w-0 flex-1 truncate rounded-full border border-border bg-card px-3 py-1 text-caption text-muted-foreground">
          {address}
        </span>
      </div>
      {children}
    </div>
  );
}

interface HomepageProps {
  readonly nav: readonly string[];
  readonly eyebrow: string;
  readonly headline: ReactNode;
  readonly caption: string;
  readonly cta: string;
}

/**
 * A static drawing of the hancrafted landing hero, its words copied as plain strings from the landing page's
 * Translation files (FE-007 §5: a Slide imports nothing from page assembly). Nothing in it is a link.
 */
export function Homepage({ nav, eyebrow, headline, caption, cta }: HomepageProps) {
  return (
    <div className="flex flex-col gap-5 p-5 @3xl:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 text-caption">
        <span className="flex items-center gap-2 font-semibold">
          <span className="flex size-5 items-center justify-center rounded-full bg-foreground">
            <span className="size-1.5 rounded-full bg-brand-accent" />
          </span>
          hancrafted
        </span>
        <span className="flex gap-4 text-muted-foreground">
          {nav.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </span>
      </div>
      <p className="text-caption text-muted-foreground uppercase">{eyebrow}</p>
      <p className="text-body leading-tight font-semibold tracking-tight">{headline}</p>
      <p className="text-caption text-muted-foreground">{caption}</p>
      <span className="w-fit rounded-full bg-foreground px-4 py-2 text-caption font-medium text-background">{cta}</span>
    </div>
  );
}
