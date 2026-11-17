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
  settled: boolean;
  revealed: boolean;
  idPrefix?: string;
  nested?: boolean;
  crossPage?: boolean;
}
