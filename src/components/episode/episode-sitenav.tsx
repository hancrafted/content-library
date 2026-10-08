import { sectionAnchor, slideAnchor } from '@/lib/episode.pure';
import { localizePath, type Locale } from '@/lib/locale.pure';
import Link from 'next/link';
import type { TowerSection } from './episode-tower';

const LINK = 'block rounded-md px-2 py-1 transition-colors hover:bg-accent hover:text-accent-foreground';

function SitenavLink(props: { locale: Locale; route: string; anchor: string; title: string; className: string }) {
  return (
    <Link
      href={localizePath(props.route, props.locale, props.anchor)}
      data-testid={`sitenav-${props.anchor}`}
      className={`${LINK} ${props.className}`}
    >
      {props.title}
    </Link>
  );
}

function SitenavSection({ locale, route, section }: { locale: Locale; route: string; section: TowerSection }) {
  return (
    <li>
      <SitenavLink
        {...{ locale, route }}
        anchor={sectionAnchor(section.slug)}
        title={section.title}
        className="font-semibold"
      />
      <ol className="mt-1 ml-2 flex flex-col border-l pl-2">
        {section.slides.map((slide) => (
          <li key={slide.slug}>
            <SitenavLink
              {...{ locale, route }}
              anchor={slideAnchor(section.slug, slide.slug)}
              title={slide.title}
              className="text-muted-foreground"
            />
          </li>
        ))}
      </ol>
    </li>
  );
}

/** Every Section with its page slides, all expanded. */
export function EpisodeSitenav(props: {
  locale: Locale;
  route: string;
  navLabel: string;
  sections: readonly TowerSection[];
}) {
  return (
    <nav aria-label={props.navLabel} data-testid="episode-sitenav" className="text-sm">
      <ol className="flex flex-col gap-3">
        {props.sections.map((section) => (
          <SitenavSection key={section.slug} locale={props.locale} route={props.route} section={section} />
        ))}
      </ol>
    </nav>
  );
}
