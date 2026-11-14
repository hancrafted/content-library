import { cn } from '@/shared/lib/utils';
import type { CSSProperties, ReactNode } from 'react';
import { zoneToken, type Zone } from '../iceberg/ruler.pure';
import styles from './figure-gallery.module.css';
import { GalleryMotion, type GalleryMotionLabels } from './gallery-motion.client';

export function FigureGallery({
  item,
  intro,
  contract,
  labels,
  children,
}: {
  readonly item: string;
  readonly intro: string;
  readonly contract: string;
  readonly labels: GalleryMotionLabels;
  readonly children: ReactNode;
}) {
  return (
    <div data-gallery-item={item} className="space-y-6 pb-12">
      <p className="max-w-prose text-body">{intro}</p>
      <p className="max-w-prose text-caption text-muted-foreground">{contract}</p>
      <GalleryMotion labels={labels}>
        <div className="grid gap-6 xl:grid-cols-2">{children}</div>
      </GalleryMotion>
    </div>
  );
}

export function Specimen({
  variant,
  label,
  usage,
  code,
  viewBox = '-110 -160 300 200',
  zone = 'surface',
  children,
}: {
  readonly variant: string;
  readonly label: string;
  readonly usage: string;
  readonly code: string;
  readonly viewBox?: string;
  readonly zone?: Zone;
  readonly children: ReactNode;
}) {
  return (
    <figure data-gallery-variant={variant} className="m-0 overflow-hidden rounded-xl border border-border bg-card">
      <SpecimenImage viewBox={viewBox} label={label} zone={zone}>
        {children}
      </SpecimenImage>
      <figcaption className="space-y-3 p-4">
        <p className="text-body font-semibold">{label}</p>
        <UsageExample label={usage} code={code} />
      </figcaption>
    </figure>
  );
}

function SpecimenImage({
  viewBox,
  label,
  zone,
  children,
}: {
  readonly viewBox: string;
  readonly label: string;
  readonly zone: Zone;
  readonly children: ReactNode;
}) {
  const surface = { '--specimen-surface': zoneToken(zone) } as CSSProperties;
  return (
    <svg
      viewBox={viewBox}
      role="img"
      aria-label={label}
      data-depth-zone={zone}
      style={surface}
      className={cn(styles.specimen, 'block h-64 w-full')}
    >
      {children}
    </svg>
  );
}

function UsageExample({ label, code }: { readonly label: string; readonly code: string }) {
  return (
    <details>
      <summary className="cursor-pointer py-2 text-caption text-primary">{label}</summary>
      <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 text-caption">
        <code>{code}</code>
      </pre>
    </details>
  );
}
