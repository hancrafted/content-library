'use client';

import dynamic from 'next/dynamic';

// Loaded on demand and never prerendered. The page that mounts it does so only under `next dev`.
const TokenEditor = dynamic(() => import('./token-editor.client'), { ssr: false });

export function DesignSystemTokenEditor() {
  return <TokenEditor />;
}
