import type { getTranslations } from 'next-intl/server';

/** The translator of the `eventPage` namespace the Event page's parts read their words through. */
export type EventT = Awaited<ReturnType<typeof getTranslations<'eventPage'>>>;
