'use client';

import { useEffect } from 'react';

/** The method rail adds pin spacing during hydration, after the browser follows the initial hash. */
export function AboutAnchor() {
  useEffect(() => {
    if (window.location.hash !== '#about') return;
    const frame = requestAnimationFrame(() => {
      document.getElementById('about')?.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  return null;
}
