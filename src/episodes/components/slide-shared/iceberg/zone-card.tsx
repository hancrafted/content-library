import { cn } from '@/shared/lib/utils';
import type { ComponentProps } from 'react';
import styles from './zone-card.module.css';

/**
 * A card that reads on any zone (design guide, Iceberg: text keeps its contrast at every depth): the card's own
 * paper and text, whatever the zone did to the Slide's text tokens. Layout stays the Slide's, by `className`.
 */
export function ZoneCard({ className, ...props }: ComponentProps<'div'>) {
  return <div {...props} className={cn(styles.card, className)} />;
}
