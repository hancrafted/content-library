import type { Locale } from '@/shared/lib/locale.pure';
import type { MouseEvent } from 'react';

/** Everything a part of the table reads besides its own entry. */
export interface TocView {
  locale: Locale;
  route: string;
  /** The Slide id that means the top of the page: no entry is current while it is active, and the heading links to it. */
  topId: string;
  /** True while `topId` is the active Slide. */
  atTop: boolean;
  /** The click handler of every link: tells the page the reader chose that Slide, then glides to it. */
  glideTo: (event: MouseEvent<HTMLAnchorElement>, id: string) => void;
  active: string | null;
  open: ReadonlySet<string>;
  toggle: (id: string) => void;
  /** False until the first observation has painted; motion stays off until then, so a reload mid-page never animates its way there. */
  settled: boolean;
  /** False while the compact loading box stands in for the table, masking the first settle. */
  revealed: boolean;
  /** Unique per rendered panel, since the desktop panel and the drawer both render one. */
  idPrefix?: string;
}
