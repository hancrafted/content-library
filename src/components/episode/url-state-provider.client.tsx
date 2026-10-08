'use client';

import { UrlStateContext } from '@/hooks/use-url-state';
import { createUrlState } from '@/lib/url-state';
import { useEffect, useState, type ReactNode } from 'react';

/**
 * Provides one URL-state service to an Episode page (FE-001 §2). It lives with
 * the page, so another Episode mounts a fresh service that reads its own URL.
 * Built on the client only, since prerender has no `window`; consumers read
 * `null` there. Renders no element of its own, so the page grid is untouched.
 */
export function UrlStateProvider({ children }: { children: ReactNode }) {
  const [service] = useState(() => (typeof window === 'undefined' ? null : createUrlState(window)));
  useEffect(() => () => service?.dispose(), [service]);
  return <UrlStateContext value={service}>{children}</UrlStateContext>;
}
