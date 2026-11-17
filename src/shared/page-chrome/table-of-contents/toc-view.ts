import type { Locale } from '@/shared/lib/locale.pure';
import type { MouseEvent } from 'react';

export interface TocView {
  locale: Locale;
  route: string;
  topId: string;
  atTop: boolean;
  glideTo: (event: MouseEvent<HTMLAnchorElement>, id: string) => void;
  active: string | null;
  open: ReadonlySet<string>;
  toggle: (id: string) => void;
  /** False until the first observation has painted; motion stays off until then, so a reload mid-page never animates its way there. */
  settled: boolean;
  revealed: boolean;
  /** Unique per rendered panel, since the desktop panel and the drawer both render one. */
  idPrefix?: string;
  /** Nested inside another page's branch, so child rows use the available width rather than the rail's fixed width. */
  nested?: boolean;
  crossPage?: boolean;
}
