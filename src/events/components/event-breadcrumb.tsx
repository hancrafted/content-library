import { localizePath, type Locale } from '@/lib/locale.pure';
import { eventRoute, ROUTES, type EventSlug } from '@/lib/routes';
import Link from 'next/link';

interface EventBreadcrumbProps {
  locale: Locale;
  /** The trail's accessible name and the Events list's own label, in the page's locale. */
  labels: { readonly breadcrumb: string; readonly events: string };
  /** The Event: its slug and title, a link on an Event-scoped Episode page and the current page on the Event's own. */
  event: { readonly slug: EventSlug; readonly title: string };
  /** The title of the Episode an Event-scoped Episode page shows; it ends the trail. */
  episode?: string;
}

const LINK =
  'rounded-sm underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:ring-2 focus-visible:ring-foreground/50 focus-visible:outline-none';

/** The Event's step: the current page on the Event's own, a link back to it on an Episode page under it. */
function EventStep({ locale, event, current }: Pick<EventBreadcrumbProps, 'locale' | 'event'> & { current: boolean }) {
  if (current)
    return (
      <li aria-current="page" className="text-foreground">
        {event.title}
      </li>
    );
  return (
    <li>
      <Link href={localizePath(eventRoute(event.slug), locale)} className={LINK}>
        {event.title}
      </Link>
    </li>
  );
}

/** The trail above an Event's pages (design-ADR 0016, Routes and visibility): Events / the Event, then the Episode under it. */
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
        <EventStep locale={locale} event={event} current={episode === undefined} />
        {episode !== undefined && (
          <>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-foreground">
              {episode}
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}
