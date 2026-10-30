import type { ReactNode } from 'react';

/** The browser window's title bar: three dots and the page address. */
function BrowserBar({ page }: { page: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-2" aria-hidden="true">
      <span className="size-2.5 shrink-0 rounded-full bg-muted-foreground/30" />
      <span className="size-2.5 shrink-0 rounded-full bg-muted-foreground/30" />
      <span className="size-2.5 shrink-0 rounded-full bg-muted-foreground/30" />
      <span className="ml-3 min-w-0 flex-1 truncate rounded-full bg-card px-3 py-0.5 text-caption text-muted-foreground">
        {page}
      </span>
    </div>
  );
}

/** The drawn sign-in card in the browser window: a picture of the step, not a screenshot of the vendor's page. */
export function SignInCard({
  page,
  title,
  button,
  own,
}: {
  page: string;
  title: ReactNode;
  button: string;
  own: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background shadow-md">
      <BrowserBar page={page} />
      <div className="flex flex-col items-center gap-3 p-5 text-center">
        <span
          className="flex size-9 items-center justify-center rounded-full bg-ai/15 text-ai ring-1 ring-ai/40"
          aria-hidden="true"
        >
          ✻
        </span>
        <p className="text-body font-semibold">{title}</p>
        <span className="w-full rounded-full bg-primary py-2 text-caption font-semibold text-primary-foreground">
          {button}
        </span>
        <p className="text-caption text-muted-foreground">{own}</p>
      </div>
    </div>
  );
}
