// decision: FE-007 §1.3
// decision: FE-005 §1
import type { RegistryFile } from './episode-registry.pure.ts';

export interface EpisodeRoute {
  readonly event?: string;
  readonly slug: string;
  readonly folder: string;
  readonly exported: string;
}

const GENERATED_ROUTE_SHAPE = /<EpisodePage page=\{\w+\(PAGE_PARAMS\)\} composition=\{episode\}/;

export const ROUTE_GROUPS = ['src/app/(en)', 'src/app/[locale]'] as const;

export function isGeneratedRoute(text: string): boolean {
  return GENERATED_ROUTE_SHAPE.test(text);
}

function urlOf({ event, slug }: EpisodeRoute): string {
  return `${event === undefined ? '' : `events/${event}/`}episodes/${slug}`;
}

function imports(route: EpisodeRoute, ofPage: string): string {
  const record = route.exported === 'episode' ? 'episode' : `${route.exported} as episode`;
  return `import { ${record} } from '@/episodes/${route.folder}/episode';
import { EpisodePage, episodePageCopy, ${ofPage} } from '@/page-assembly/episode/episode-page';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';`;
}

function params({ event, slug }: EpisodeRoute): string {
  return event === undefined
    ? `const PAGE_PARAMS = { episode: '${slug}' };`
    : `const PAGE_PARAMS = { event: '${event}', episode: '${slug}' };`;
}

function defaultLocaleRoute(route: EpisodeRoute, ofPage: string): string {
  return `${imports(route, ofPage)}
import { DEFAULT_LOCALE } from '@/shared/lib/locale.pure';

${params(route)}

export async function generateMetadata() {
  const page = ${ofPage}(PAGE_PARAMS);
  return pageMetadata(page, DEFAULT_LOCALE, episodePageCopy(page, DEFAULT_LOCALE));
}

export default function Page() {
  return <EpisodePage page={${ofPage}(PAGE_PARAMS)} composition={episode} locale={DEFAULT_LOCALE} />;
}
`;
}

function prefixedLocaleRoute(route: EpisodeRoute, ofPage: string): string {
  const up = '../'.repeat(urlOf(route).split('/').length);
  return `${imports(route, ofPage)}
import { prefixedLocaleParams, resolveLocale, type LocaleParams } from '${up}params';

${params(route)}

export const dynamicParams = false;
export const generateStaticParams = prefixedLocaleParams;

export async function generateMetadata({ params }: LocaleParams) {
  const page = ${ofPage}(PAGE_PARAMS);
  const locale = await resolveLocale(params);
  return pageMetadata(page, locale, episodePageCopy(page, locale));
}

export default async function Page({ params }: LocaleParams) {
  return <EpisodePage page={${ofPage}(PAGE_PARAMS)} composition={episode} locale={await resolveLocale(params)} />;
}
`;
}

export function episodeRouteFiles(routes: readonly EpisodeRoute[]): RegistryFile[] {
  const urls = routes.map(urlOf);
  const repeated = urls.find((url, index) => urls.indexOf(url) !== index);
  if (repeated !== undefined) throw new Error(`Two Episodes would be built at /${repeated}/`);
  return [...routes]
    .sort((a, b) => (urlOf(a) < urlOf(b) ? -1 : 1))
    .flatMap((route) => {
      const ofPage = route.event === undefined ? 'episodesPathPageOf' : 'eventEpisodePageOf';
      const [defaultGroup, prefixedGroup] = ROUTE_GROUPS;
      return [
        { path: `${defaultGroup}/${urlOf(route)}/page.tsx`, text: defaultLocaleRoute(route, ofPage) },
        { path: `${prefixedGroup}/${urlOf(route)}/page.tsx`, text: prefixedLocaleRoute(route, ofPage) },
      ];
    });
}
