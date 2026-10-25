import { localizePath, type Locale } from '@/lib/locale.pure';
import { ROUTES } from '@/lib/routes';
import Link from 'next/link';

/** One step back up the trail: its label and the logical path it opens. */
export interface Crumb {
  readonly label: string;
  readonly route: string;
}

interface EventBreadcrumbProps {
  locale: Locale;
  /** The trail's accessible name and the Events list's own label, in the page's locale. */
  labels: { readonly breadcrumb: string; readonly events: string };
  /** The Event, as a link on an Event-scoped Episode page and as the current page on the Event's own. */
  event: Crumb;
  /** The Episode the page shows, when it is an Event-scoped Episode page; it ends the trail. */
  episode?: string;
}

const LINK =
  'rounded-sm underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:ring-2 focus-visible:ring-foreground/50 focus-visible:outline-none';

/** The trail above an Event's pages (design-ADR 0016, Event page behaviour): Events / the Event / the Episode. */
export function EventBreadcrumb({ locale, labels, event, episode }: EventBreadcrumbProps) {
  return (
    <nav aria-label={labels.breadcrumb} data-event-breadcrumb className="text-caption text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <li>
          <Link href={localizePath(ROUTES.events, locale)} className={LINK}>
            {labels.events}
          </Link>
        </li>
        <li aria-hidden>/</li>
        <li>
          {episode === undefined ? (
            <span aria-current="page">{event.label}</span>
          ) : (
            <Link href={localizePath(event.route, locale)} className={LINK}>
              {event.label}
            </Link>
          )}
        </li>
        {episode !== undefined && (
          <>
            <li aria-hidden>/</li>
            <li aria-current="page">{episode}</li>
          </>
        )}
      </ol>
    </nav>
  );
}
