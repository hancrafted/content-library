import { useEffect, useRef } from 'react';
import type { FactoryPainter } from './factory-painter.ts';

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
