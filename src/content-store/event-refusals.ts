import type { Event } from './schemas/event.schema';

/** The Event's slug starts with its date: `<date>-<name>`, the date being the day it takes place (design-ADR 0016 decision 8). */
const EVENT_SLUG = /^(\d{4}-\d{2}-\d{2})-[a-z0-9]/;

export function eventRefusals(event: Event): string[] {
  const date = EVENT_SLUG.exec(event.slug)?.[1];
  return date === event.date
    ? []
    : [`Event ${event.slug}: slug must be <date>-<name>, starting with its date ${event.date}`];
}
