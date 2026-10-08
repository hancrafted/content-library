'use client';

import { SEGMENTED_GROUP, segmentedItem } from '@/components/segmented';
import { Sitenav, SITENAV_VARIANTS, type SitenavVariant } from '@/components/sitenav/sitenav';
import { Button } from '@/components/ui/button';
import { useState, type ComponentProps } from 'react';

/**
 * TEMPORARY: renders the sitenav with a Rail/Index switch so both designs can
 * be compared on the real page. Delete once one is chosen and render
 * `<Sitenav variant=…>` directly from the tower.
 */
export function SitenavPreview(props: {
  sitenav: Omit<ComponentProps<typeof Sitenav>, 'variant'>;
  labels: Record<'label' | SitenavVariant, string>;
}) {
  const [variant, setVariant] = useState<SitenavVariant>('rail');
  return (
    <>
      <Sitenav {...props.sitenav} variant={variant} />
      <div
        role="group"
        aria-label={props.labels.label}
        className={`fixed right-4 bottom-20 z-40 md:bottom-4 shadow-header ${SEGMENTED_GROUP} bg-background/80 backdrop-blur-xl`}
      >
        {SITENAV_VARIANTS.map((option) => (
          <Button
            key={option}
            type="button"
            size="sm"
            variant="ghost"
            aria-pressed={option === variant}
            className={segmentedItem(option === variant)}
            onClick={() => setVariant(option)}
          >
            {props.labels[option]}
          </Button>
        ))}
      </div>
    </>
  );
}
