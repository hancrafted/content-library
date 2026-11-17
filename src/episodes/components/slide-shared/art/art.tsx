import { ART_NOW_SCRIPT } from '@/episodes/lib/art-href.pure';
import { artMode } from '@/episodes/lib/art-manifest';
import type { ReactNode } from 'react';
import { artUrl } from './art.pure';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

interface ArtProps {
  readonly name: string;
  readonly className?: string;
  readonly transform?: string;
  readonly children: ReactNode;
}

// decision: docs/adr/0025-scene-figures-are-deep-modules.md
// decision: FE-009 §4
export function Art({ name, className, transform, children }: ArtProps) {
  const art = artMode();
  const url = art.mode === 'use' ? artUrl(name, art.manifest, BASE_PATH) : null;
  if (url !== null) return <use data-art={url} className={className} transform={transform} />;
  const marked = art.mode === 'mark' ? name : undefined;
  if ([marked, className, transform].every((value) => value === undefined)) return children;
  return (
    <g data-art-source={marked} className={className} transform={transform}>
      {children}
    </g>
  );
}

// decision: FE-009 §4.3
export function ArtNow() {
  if (artMode().mode !== 'use') return null;
  return <script dangerouslySetInnerHTML={{ __html: ART_NOW_SCRIPT }} />;
}
