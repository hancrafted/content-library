import { localizePath, type Locale } from '@/lib/locale.pure';
import { ROUTES } from '@/lib/routes';
import Link from 'next/link';

interface EventBreadcrumbProps {
  locale: Locale;
  /** The trail's accessible name and the Events list's own label, in the page's locale. */
  labels: { readonly breadcrumb: string; readonly events: string };
  /** The Event's title, the current page that ends the trail. */
  event: string;
}

const LINK =
  'rounded-sm underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:ring-2 focus-visible:ring-foreground/50 focus-visible:outline-none';

/** The trail above an Event's page (design-ADR 0016, Event page): Events / the Event. */
export function EventBreadcrumb({ locale, labels, event }: EventBreadcrumbProps) {
  return (
    <nav aria-label={labels.breadcrumb} data-event-breadcrumb className="text-caption text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <li>
          <Link href={localizePath(ROUTES.events, locale)} className={LINK}>
            {labels.events}
          </Link>
        </li>
        <li aria-hidden>/</li>
        <li aria-current="page" className="text-foreground">
          {event}
        </li>
      </ol>
    </nav>
  );
}
