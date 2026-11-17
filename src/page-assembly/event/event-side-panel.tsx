import { ORGANIZERS } from '@/content-store/schemas/fields';
import type { ServedEvent } from '@/content-store/store';
import { externalHref } from '@/shared/lib/external-link.pure';
import { fillTemplate } from '@/shared/lib/template.pure';
import Image from 'next/image';
import type { ReactNode } from 'react';
import type { EventT } from './event-translator';
import en from './i18n/en.json';

function hasImageAlt(slug: string): slug is keyof typeof en.eventPage.imageAlt {
  return slug in en.eventPage.imageAlt;
}

function imageAlt(slug: string, t: EventT): string {
  if (!hasImageAlt(slug))
    throw new Error(`No Translation names the image of Event "${slug}": add eventPage.imageAlt.${slug}`);
  return t(`imageAlt.${slug}`);
}

// decision: FE-003 §2
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

export function SidePanelTop({ record, t, facts }: { record: ServedEvent; t: EventT; facts: ReactNode }) {
  return (
    <div data-event-side-top className="mt-8 flex flex-col gap-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0">
      <EventImage record={record} t={t} />
      {facts}
    </div>
  );
}

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
