'use client';

import { UrlStateContext } from '@/shared/hooks/use-url-state';
import { createUrlState } from '@/shared/lib/url-state';
import { createUrlNavigationBrowser } from '@/shared/lib/url-state-browser';
import { useEffect, useState, type ReactNode } from 'react';

// decision: FE-001 §2
export function UrlStateProvider({ children }: { children: ReactNode }) {
  const [service] = useState(() =>
    typeof window === 'undefined' ? null : createUrlState(window, createUrlNavigationBrowser(window, 'data-slide')),
  );
  useEffect(() => {
    service?.attach();
    return () => service?.dispose();
  }, [service]);
  return <UrlStateContext value={service}>{children}</UrlStateContext>;
}
