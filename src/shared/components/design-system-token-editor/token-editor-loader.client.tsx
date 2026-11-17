'use client';

import dynamic from 'next/dynamic';

const TokenEditor = dynamic(() => import('./token-editor.client'), { ssr: false });

export function DesignSystemTokenEditor() {
  return <TokenEditor />;
}
