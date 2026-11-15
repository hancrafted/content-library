import { ART_NOW_SCRIPT } from '@/episodes/lib/art-href.pure';
import { artMode } from '@/episodes/lib/art-manifest';
import type { ReactNode } from 'react';
import { artUrl } from './art.pure';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

interface ArtProps {
  /**
   * The drawing's name in the art store, one per picture: a figure part and its pose (`robot/hull-lamp-lit`), or a
   * Slide's backdrop part. Two drawings under one name stay inline, and `npm run art` names them.
   */
  readonly name: string;
  /** The page's class on the `<use>`: its motion, when the drawing moves as a whole. */
  readonly className?: string;
  readonly transform?: string;
  /** The drawing: still SVG shapes, painted by its CSS module's simple selectors. No text, ids or motion inside. */
  readonly children: ReactNode;
}

/**
 * Scene art as a static asset (design-ADR 0025, decision 63): in a production build, one `<use>` pointing at the
 * drawing's content-hashed file under `/art/`, its URL in `data-art` and no `href`, so its Scene's client root fetches
 * it only near the viewport (FE-009 §4). The custom properties the figure's host group sets inherit into the file,
 * so tokens and dark mode reach it. While `npm run art` renders, the drawing draws inline in a group marked
 * `data-art-source`, which the art build bakes into the file; in `next dev` and the tests it draws inline as it always
 * has. A drawing the art build kept inline, because a Slide's CSS repaints it, draws inline in a production build too.
 */
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

/**
 * Loads the art of the Scene root it sits in as the HTML parses: the Title slide's Scene, whose first paint must not
 * wait for hydration (FE-009 §4.3). Nothing in `next dev`, where the art is inline.
 */
export function ArtNow() {
  if (artMode().mode !== 'use') return null;
  return <script dangerouslySetInnerHTML={{ __html: ART_NOW_SCRIPT }} />;
}
