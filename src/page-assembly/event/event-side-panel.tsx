import { ORGANIZERS } from '@/content-store/schemas/fields';
import type { ServedEvent } from '@/content-store/store';
import { externalHref } from '@/shared/lib/external-link.pure';
import { fillTemplate } from '@/shared/lib/template.pure';
import Image from 'next/image';
import type { ReactNode } from 'react';
import type { EventT } from './event-translator';
import en from './i18n/en.json';

/** Whether an Event slug has its image alt in the Translation files, the keys `eventPage.imageAlt.<slug>`. */
function hasImageAlt(slug: string): slug is keyof typeof en.eventPage.imageAlt {
  return slug in en.eventPage.imageAlt;
}

/** The image's alt text, a Translation key by Event slug; an Event with an image and no alt is a bug, so it throws. */
function imageAlt(slug: string, t: EventT): string {
  if (!hasImageAlt(slug))
    throw new Error(`No Translation names the image of Event "${slug}": add eventPage.imageAlt.${slug}`);
  return t(`imageAlt.${slug}`);
}

/** An external link that opens a new tab and says so to screen readers (FE-003 §2). */
function ExternalLink({ url, newTab, children }: { url: string; newTab: string; children: ReactNode }) {
  return (
    <a
      href={externalHref(url)}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-sm underline underline-offset-4 hover:text-primary focus-visible:ring-2 focus-visible:ring-foreground/50 focus-visible:outline-none"
    >
      {children}
      <span aria-hidden> ↗</span>
      <span className="sr-only"> {newTab}</span>
    </a>
  );
}

/** The partner's "View on …" link, when the Event has a listing. */
function Listing({ record, t }: { record: ServedEvent; t: EventT }) {
  if (record.listing === undefined) return null;
  const name = ORGANIZERS[record.organizers[0]].name;
  return (
    <p data-event-listing className="text-body">
      <ExternalLink url={record.listing} newTab={t('newTab')}>
        {fillTemplate(t.raw('viewOn') as string, { name })}
      </ExternalLink>
    </p>
  );
}

/** The "See also" links, when the Event has references. */
function References({ record, t }: { record: ServedEvent; t: EventT }) {
  if (record.references === undefined) return null;
  return (
    <section data-event-references>
      <h2 className="text-caption text-muted-foreground">{t('seeAlso')}</h2>
      <ul className="mt-1 space-y-1 text-body text-foreground">
        {record.references.map(({ label, url }) => (
          <li key={url}>
            <ExternalLink url={url} newTab={t('newTab')}>
              {label}
            </ExternalLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The image with its credit, when the Event has one. */
function EventImage({ record, t }: { record: ServedEvent; t: EventT }) {
  if (record.image === undefined) return null;
  return (
    <figure data-event-image>
      <Image
        src={record.image.src}
        alt={imageAlt(record.slug, t)}
        width={1200}
        height={320}
        className="h-auto w-full rounded-lg border border-border"
      />
      <figcaption className="mt-2 text-caption text-muted-foreground">{record.image.credit}</figcaption>
    </figure>
  );
}

/**
 * The top of the side panel, the image and the facts: right after the title in the DOM, so a stacked page and a
 * screen reader meet the Event's image and its date and place before the description. From `lg` it is the top of
 * the second column.
 */
export function SidePanelTop({ record, t, facts }: { record: ServedEvent; t: EventT; facts: ReactNode }) {
  return (
    <div data-event-side-top className="mt-8 flex flex-col gap-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0">
      <EventImage record={record} t={t} />
      {facts}
    </div>
  );
}

/**
 * The rest of the side panel: the Organizers, the partner's listing and the references, after the main column in
 * the DOM and under the top in the second column from `lg`. The Organizers always show; the listing and the
 * references only when the Event has them, so an Event with neither gets a panel of facts and Organizers.
 */
export function SidePanelBottom({ record, t }: { record: ServedEvent; t: EventT }) {
  return (
    <aside
      data-event-side
      aria-label={t('sideLabel')}
      className="mt-14 flex flex-col gap-6 lg:col-start-2 lg:row-start-3 lg:mt-6"
    >
      <Organizers record={record} t={t} />
      <Listing record={record} t={t} />
      <References record={record} t={t} />
    </aside>
  );
}

/** The Organizers, lead first, each a link to its page when the registry knows one. */
function Organizers({ record, t }: { record: ServedEvent; t: EventT }) {
  return (
    <div data-event-organizers>
      <h2 className="text-caption text-muted-foreground">{t('organizedBy')}</h2>
      <ul className="mt-1 text-body text-foreground">
        {record.organizers.map((id, index) => {
          const { name, url } = ORGANIZERS[id];
          return (
            <li key={id} className="inline">
              {index > 0 && ', '}
              {url === undefined ? (
                name
              ) : (
                <ExternalLink url={url} newTab={t('newTab')}>
                  {name}
                </ExternalLink>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
