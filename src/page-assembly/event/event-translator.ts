import type { getTranslations } from 'next-intl/server';

export type EventT = Awaited<ReturnType<typeof getTranslations<'eventPage'>>>;
