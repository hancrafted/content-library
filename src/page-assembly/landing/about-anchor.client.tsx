'use client';

import { useEffect } from 'react';

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
