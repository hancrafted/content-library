/** A calendar day, `2026-10-23`. Spelled out here: importing it from the Episode metadata would loop back through the routes. */
type IsoDate = `${number}-${number}-${number}`;

/*
 * The Workshops: dated, ordered sets of Episodes, listed at /workshops. One
 * record each; a Workshop's title and description are Translation keys by slug
 * (`workshops.items.<slug>`), so nothing a visitor reads is written here (FE-003).
 */

export interface WorkshopRecord {
  /** A readable name and the date, so a shared link says what and when: `ai-onboarding-2026-10-23`. */
  readonly slug: string;
  readonly date: IsoDate;
  /** The start as the venue writes it, `09:30`; the same in every locale. */
  readonly time?: string;
  /** A place name; the same in every locale. */
  readonly location?: string;
  /** Episode slugs in the order the Workshop teaches them; an upcoming Episode may be among them. */
  readonly episodes: readonly string[];
}

export const WORKSHOPS = [
  {
    slug: 'ai-onboarding-2026-10-23',
    date: '2026-10-23',
    episodes: ['onboard-ai-every-time', 'ai-attention-span', 'ai-gives-you-more-work'],
  },
] as const satisfies readonly WorkshopRecord[];

export type WorkshopSlug = (typeof WORKSHOPS)[number]['slug'];

function duplicates(items: readonly string[]): string[] {
  return items.filter((item, index) => items.indexOf(item) !== index);
}

function problemsOf(workshop: WorkshopRecord, known: readonly string[]): string[] {
  const { slug, date, episodes } = workshop;
  const own = (problem: string) => `${slug}: ${problem}`;
  return [
    ...(slug.endsWith(`-${date}`) ? [] : [own(`the slug must end in its date ${date}`)]),
    ...(episodes.length === 0 ? [own('a Workshop lists at least one Episode')] : []),
    ...episodes
      .filter((episode) => !known.includes(episode))
      .map((episode) => own(`"${episode}" is not a registered Episode`)),
    ...[...new Set(duplicates(episodes))].map((episode) => own(`"${episode}" is listed twice`)),
  ];
}

/**
 * What is wrong with the Workshop record, one sentence each; empty when it is sound. The registered
 * Episode slugs come in as an argument: the routes module derives its page list from this record, so
 * this one cannot import it back.
 */
export function workshopProblems(workshops: readonly WorkshopRecord[], known: readonly string[]): string[] {
  const slugs = workshops.map((workshop) => workshop.slug);
  const shared = [...new Set(duplicates(slugs))].map((slug) => `${slug}: the slug is used by more than one Workshop`);
  return [...workshops.flatMap((workshop) => problemsOf(workshop, known)), ...shared];
}
