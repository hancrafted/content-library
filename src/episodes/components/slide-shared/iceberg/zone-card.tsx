import { cn } from '@/shared/lib/utils';
import type { ComponentProps } from 'react';
import styles from './zone-card.module.css';

export function ZoneCard({ className, ...props }: ComponentProps<'div'>) {
  return <div {...props} className={cn(styles.card, className)} />;
}
