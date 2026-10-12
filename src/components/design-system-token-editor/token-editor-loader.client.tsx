'use client';

import dynamic from 'next/dynamic';

// Loaded on demand and never prerendered. EpisodePageContainer mounts this only under `next dev`.
const TokenEditor = dynamic(() => import('./token-editor.client'), { ssr: false });

export function DesignSystemTokenEditor() {
  return <TokenEditor />;
}
