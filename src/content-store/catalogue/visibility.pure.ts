import type { Episode, EpisodeStatus } from '../schemas/episode.schema';
import { matchPage, type EpisodeId, type PageRef } from './record-routes';

// decision: docs/decision-records/0016-content-data-model.md
// decision: FE-008 §5
export interface PageFacts {
  readonly visibility?: Episode['visibility'];
  readonly status?: EpisodeStatus;
  readonly copy?: boolean;
}

export interface PageTreatment {
  readonly exported: boolean;
  readonly inSitemap: boolean;
  readonly index: boolean;
  readonly listed: boolean;
  readonly canonical: 'self' | { readonly episode: EpisodeId };
}

export interface TreatedPage {
  readonly page: PageRef;
  readonly treatment: PageTreatment;
}

const LISTED: PageTreatment = { exported: true, inSitemap: true, index: true, listed: true, canonical: 'self' };
const HIDDEN: PageTreatment = { exported: true, inSitemap: false, index: false, listed: false, canonical: 'self' };
const ABSENT: PageTreatment = { exported: false, inSitemap: false, index: false, listed: false, canonical: 'self' };
const ANNOUNCED: PageTreatment = { ...HIDDEN, listed: true };
const SELF_INDEXED: PageTreatment = { ...LISTED, listed: false };

export function episodePageTreatment({ visibility, status, copy }: PageFacts): PageTreatment {
  if (visibility === 'unlisted' || copy) return ABSENT;
  if (visibility !== 'public') return HIDDEN;
  if (status === 'published') return LISTED;
  return status === 'upcoming' ? ANNOUNCED : HIDDEN;
}

function eventEpisodeTreatment(episode: EpisodeId, facts: PageFacts): PageTreatment {
  if (facts.copy) return facts.visibility === 'public' && facts.status === 'published' ? SELF_INDEXED : HIDDEN;
  if (!episodePageTreatment(facts).inSitemap) return HIDDEN;
  return { exported: true, inSitemap: false, index: true, listed: false, canonical: { episode } };
}

export function pageTreatment(page: PageRef, facts: PageFacts): PageTreatment {
  return matchPage(
    page,
    {
      home: () => LISTED,
      dashboard: () => HIDDEN,
      episodes: () => LISTED,
      events: () => LISTED,
      explorables: () => LISTED,
      guides: () => LISTED,
      resources: () => LISTED,
      episode: () => episodePageTreatment(facts),
      'explorable-page': () => (facts.visibility === 'public' ? LISTED : HIDDEN),
      guide: () => (facts.visibility === 'public' ? LISTED : HIDDEN),
      template: () => (facts.visibility === 'public' ? LISTED : HIDDEN),
      event: () => (facts.visibility === 'public' ? LISTED : HIDDEN),
      'event-episode': ({ episode }) => eventEpisodeTreatment(episode.id, facts),
    },
    () => ABSENT,
  );
}
