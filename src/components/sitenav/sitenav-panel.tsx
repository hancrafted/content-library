import { localizePath, type Locale } from '@/lib/locale.pure';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { SitenavProgress } from './sitenav-progress';
import type { SitenavSkin } from './sitenav-skins';
import type { SitenavSection } from './sitenav.pure';

/** Everything a sitenav part reads besides its own entry. */
export interface SitenavView {
  locale: Locale;
  route: string;
  skin: SitenavSkin;
  active: string | null;
  expanded: string | null;
}

export interface SitenavLabels {
  nav: string;
  progress: string;
  open: string;
  close: string;
}

/** `01`, `02`, … — numbering lives in the sitenav only. */
export function sectionNumber(index: number): string {
  return String(index + 1).padStart(2, '0');
}

function EntryLink(props: { view: SitenavView; id: string; className: string; children: ReactNode }) {
  const { locale, route, active } = props.view;
  return (
    <Link
      href={localizePath(route, locale, props.id)}
      aria-current={active === props.id ? 'location' : undefined}
      data-testid={`sitenav-${props.id}`}
      className={props.className}
    >
      {props.children}
    </Link>
  );
}

function SectionItems({ view, section, open }: { view: SitenavView; section: SitenavSection; open: boolean }) {
  const { skin, active } = view;
  return (
    <div
      inert={!open}
      className={cn(
        'grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none',
        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
      )}
    >
      <ol className={cn('min-h-0 overflow-hidden', skin.items)}>
        {section.items.map((item) => (
          <li key={item.id} className="first:pt-1 last:pb-1">
            <EntryLink view={view} id={item.id} className={cn(skin.item, active === item.id && skin.itemActive)}>
              {item.title}
            </EntryLink>
          </li>
        ))}
      </ol>
    </div>
  );
}

function SectionEntry({ view, section, index }: { view: SitenavView; section: SitenavSection; index: number }) {
  const { skin, expanded } = view;
  const current = expanded === section.id;
  return (
    <li>
      <EntryLink
        view={view}
        id={section.id}
        className={cn(
          'flex items-baseline gap-3 py-1.5 transition-colors',
          skin.section,
          current && skin.sectionActive,
        )}
      >
        <span aria-hidden className={cn('w-8 shrink-0', skin.number, current && skin.numberActive)}>
          {sectionNumber(index)}
        </span>
        <span>{section.title}</span>
      </EntryLink>
      {section.items.length > 0 && <SectionItems view={view} section={section} open={current} />}
    </li>
  );
}

function PanelHeading({ skin, title, progress }: { skin: SitenavSkin; title: string; progress: number }) {
  return (
    <div
      className={cn(
        'mb-3 flex items-center justify-between text-xs font-medium tracking-widest uppercase',
        skin.heading,
      )}
    >
      <span>{title}</span>
      <span className={skin.percent}>{progress}%</span>
    </div>
  );
}

/**
 * The bounded sitenav panel: heading, numbered sections, the open section's
 * items, and the progress track along its edge.
 */
export function SitenavPanel(props: {
  view: SitenavView;
  sections: readonly SitenavSection[];
  labels: SitenavLabels;
  progress: number;
  className?: string;
  testId?: string;
}) {
  const { view, labels, progress } = props;
  return (
    <nav
      aria-label={labels.nav}
      data-testid={props.testId}
      className={cn('relative flex flex-col text-sm', view.skin.panel, props.className)}
    >
      <SitenavProgress skin={view.skin} progress={progress} label={labels.progress} />
      <PanelHeading skin={view.skin} title={labels.nav} progress={progress} />
      <ol className="-mr-2 flex min-h-0 flex-col gap-1 overflow-y-auto pr-2">
        {props.sections.map((section, index) => (
          <SectionEntry key={section.id} view={view} section={section} index={index} />
        ))}
      </ol>
    </nav>
  );
}
