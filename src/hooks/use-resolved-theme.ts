import { useEffect, useState } from 'react';

/**
 * Returns the currently active DOM theme ('light' | 'dark') by observing
 * the 'dark' class on document.documentElement.
 */
export function useResolvedTheme(): 'light' | 'dark' {
  const [resolved, setResolved] = useState<'light' | 'dark'>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const update = () => {
      setResolved(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    };
    update();

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return resolved;
}
