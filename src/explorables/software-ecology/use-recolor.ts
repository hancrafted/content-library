/* Re-reads the painter's token colours when the site's theme flips, and repaints. Reached only through `useFactory`. */
import { useEffect, useRef } from 'react';
import type { FactoryPainter } from './factory-painter.ts';

/** Re-reads the token colours when the theme flips, and repaints. */
export function useRecolor(painter: FactoryPainter, repaint: () => void) {
  const again = useRef(repaint);
  useEffect(() => {
    again.current = repaint;
  });
  useEffect(() => {
    const mo = new MutationObserver(() => {
      painter.recolor();
      again.current();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, [painter]);
}
